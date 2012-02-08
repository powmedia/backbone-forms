;(function($) {
    
    //Support paths for nested attributes e.g. 'user.name'
    function getNested(obj, path) {
        var fields = path.split(".");
        var result = obj;
        for (var i = 0, n = fields.length; i < n; i++) {
            result = result[fields[i]];
        }
        return result;
    }
    
    function getNestedSchema(obj, path) {
        path = path.replace(/\./g, '.subSchema.');
        return getNested(obj, path);
    }
    
    var helpers = {};
    var validators = {};
    
    /**
     * This function is used to transform the key from a schema into the title used in a label.
     * (If a specific title is provided it will be used instead).
     * 
     * By default this converts a camelCase string into words, i.e. Camel Case
     * If you have a different naming convention for schema keys, replace this function.
     * 
     * @param {String}  Key
     * @return {String} Title
     */
    helpers.keyToTitle = function(str) {
        //Add spaces
        str = str.replace(/([A-Z])/g, ' $1');

        //Uppercase first character
        str = str.replace(/^./, function(str) { return str.toUpperCase(); });

        return str;
    };

    /**
     * Helper to create a template with the {{mustache}} style tags. Template settings are reset
     * to user's settings when done to avoid conflicts.
     * @param {String}      Template string
     * @return {Template}   Compiled template
     */
    helpers.createTemplate = function(str) {
        //Store user's template options 
        var _interpolateBackup = _.templateSettings.interpolate;

        //Set custom template settings
        _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;

        var template = _.template(str);

        //Reset to users' template settings
        _.templateSettings.interpolate = _interpolateBackup;

        return template;
    };
    
    
    /**
     * Return the editor constructor for a given schema 'type'.
     * Accepts strings for the default editors, or the reference to the constructor function
     * for custom editors
     * 
     * @param {String|Function} The schema type e.g. 'Text', 'Select', or the editor constructor e.g. editors.Date
     * @param {Object}          Options to pass to editor, including required 'key', 'schema'
     * @return {Mixed}          An instance of the mapped editor
     */
    helpers.createEditor = function(schemaType, options) {
        var constructorFn;

        if (_.isString(schemaType))
            constructorFn = editors[schemaType];
        else
            constructorFn = schemaType;

        return new constructorFn(options);
    };
    
    /**
     * Triggers an event that can be cancelled. Requires the user to invoke a callback. If false
     * is passed to the callback, the action does not run.
     *
     * NOTE: This helper uses private Backbone apis so can break when Backbone is upgraded
     * 
     * @param {Mixed}       Instance of Backbone model, view, collection to trigger event on
     * @param {String}      Event name
     * @param {Array}       Arguments to pass to the event handlers
     * @param {Function}    Callback to run after the event handler has run.
     *                      If any of them passed false or error, this callback won't run
     */ 
    helpers.triggerCancellableEvent = function(subject, event, args, callback) { 
        //Return if there are no event listeners
        if (!subject._callbacks || !subject._callbacks[event]) return callback();
        
        var next = subject._callbacks[event].next;
        if (!next) return callback();
        
        var fn = next.callback,
            context = next.context || this;
        
        //Add the callback that will be used when done
        args.push(callback);
        
        fn.apply(context, args);
    }

    helpers.getValidator = function(validator) {
        var isRegExp = _(validator).isRegExp();
        if (isRegExp || validator['RegExp']) {
            if (!isRegExp) {
                validator = new RegExp(validator['RegExp']);
            }
            return function (value) {
                if (!validator.test(value)) {
                    return 'Value '+value+' does not pass validation against regular expression '+validator;
                }
            };
        } else if (_(validator).isString()) {
            if (validators[validator]) {
                return validators[validator];
            } else {
                throw 'Validator "'+validator+'" not found';
            }
        } else if (_(validator).isFunction()) {
            return validator;
        } else {
            throw 'Could not process validator' + validator;
        }
    };

    validators.required = function (value) {
        var exists = (value === 0 || !!value);
        if (!exists) {
            return 'This field is required';
        }
    };


    
    //==================================================================================================
    //TEMPLATES
    //==================================================================================================
      
    var templates = {};
    
    templates.form = helpers.createTemplate('\
      <form class="bbf-form">{{fieldsets}}</form>\
    ');

    templates.fieldset = helpers.createTemplate('\
      <fieldset>\
        {{legend}}\
        <ul>{{fields}}</ul>\
      </fieldset>\
    ');

    templates.field = helpers.createTemplate('\
    <li class="bbf-field bbf-field{{type}}">\
      <label for="{{id}}" title="test">{{title}}</label>\
      <div class="bbf-editor bbf-editor{{type}}">{{editor}}</div>\
    </li>\
    ');  

    

    var Form = Backbone.View.extend({
        
        //Field views
        fields: null,
        
        template: templates.form,
        
        fieldsetTemplate: templates.fieldset,

        /**
         * @param {Object}  Options
         *      Required:
         *          schema  {Array}
         *      Optional:
         *          model   {Backbone.Model} : Use instead of data, and use commit().
         *          data    {Array} : Pass this when not using a model. Use getValue() to get out value
         *          fields  {Array} : Keys of fields to include in the form, in display order (default: all fields)
         */
        initialize: function(options) {
            this.schema = options.schema || (options.model ? options.model.schema : {}),
            this.model = options.model;
            this.data = options.data;
            this.fieldsToRender = options.fields || _.keys(this.schema);
            this.fieldsets = options.fieldsets;
            this.idPrefix = options.idPrefix || '';

            //Stores all Field views
            this.fields = {};
            
            window.form = this;
        },

        /**
         * Renders the form and all fields
         */
        render: function() {
            var fieldsToRender = this.fieldsToRender,
                fieldsets = this.fieldsets,
                self = this;
            
            //Create el from template
            var $form = $(this.template({
              fieldsets: '<div class="bbf-placeholder"></div>'
            }));
            
            //Get a reference to where fieldsets should go and remove the placeholder
            var $fieldsetContainer = $('.bbf-placeholder', $form).parent();
            $fieldsetContainer.html('');

            if (fieldsets) {
                //TODO: Update handling of fieldsets
                _.each(fieldsets, function (fs) {
                    if (_(fs).isArray()) {
                        fs = {'fields': fs};
                    }
                    
                    //Concatenating HTML as strings won't work so we need to insert field elements into a placeholder
                    var $fieldset = $(self.fieldsetTemplate({
                      legend: (fs.legend) ? '<legend>' + fs.legend + '</legend>' : '',
                      fields: '<div class="bbf-placeholder"></div>'
                    }));
                    
                    var $fieldsContainer = $('.bbf-placeholder', $fieldset).parent();
                    $fieldsContainer.html('');
                    
                    self.renderFields(fs.fields, $fieldsContainer);
                    
                    $fieldsetContainer.append($fieldset);
                });
            } else {
                //Concatenating HTML as strings won't work so we need to insert field elements into a placeholder
                var $fieldset = $(self.fieldsetTemplate({
                  legend: '',
                  fields: '<div class="bbf-placeholder"></div>'
                }));
                
                var $fieldsContainer = $('.bbf-placeholder', $fieldset).parent();
                $fieldsContainer.html('');
                
                this.renderFields(fieldsToRender, $fieldsContainer);
                
                $fieldsetContainer.append($fieldset);
            }

            this.setElement($form);

            return this;
        },

        /**
         * Render a list of fields. Returns the rendered Field object.
         * @param {Array}           Fields to render
         * @param {jQuery}          Wrapped DOM element where field elemends will go
         */
        renderFields: function (fieldsToRender, $container) {
            var schema = this.schema,
                model = this.model,
                data = this.data,
                fields = this.fields,
                self = this;
            
            //Create form fields
            _.each(fieldsToRender, function(key) {
                var itemSchema = getNestedSchema(schema, key);

                if (!itemSchema) throw "Field '"+key+"' not found in schema";

                var options = {
                    key: key,
                    schema: itemSchema,
                    idPrefix: self.idPrefix
                };

                if (model) {
                    options.model = model;
                } else if (data) {
                    options.value = data[key];
                } else {
                    options.value = null;
                }

                var field = new Field(options);

                //Render the fields with editors, apart from Hidden fields
                if (itemSchema.type == 'Hidden') {
                    field.editor = helpers.createEditor('Hidden', options);
                } else {
                    $container.append(field.render().el);
                }

                fields[key] = field;
            });
        },

        /**
         * Validate the data
         *
         * @return {Object} Validation errors
         */
        validate: function() {
            var fields = this.fields,
                model = this.model,
                errors = {};

            _.each(fields, function(field) {
                var error = field.validate();
                if (error) {
                    errors[field.key] = error;
                }
            });

            if (model && model.validate) {
                var modelErrors = model.validate(this.getValue());
                if (modelErrors) errors._nonFieldErrors = modelErrors;
            }

            return _.isEmpty(errors) ? null : errors;
        },

        /**
         * Update the model with all latest values.
         *
         * @return {Object}  Validation errors
         */
        commit: function() {
            var fields = this.fields;

            var errors = this.validate();

            if (errors) {
                return errors;
            }

            _.each(fields, function(field) {
                var error = field.commit();
                if (error) errors[field.key] = error;
            });

            return _.isEmpty(errors) ? null : errors;
        },

        /**
         * Get all the field values as an object.
         * Use this method when passing data instead of objects
         * 
         * @param {String}  To get a specific field value pass the key name
         */
        getValue: function(key) {
            if (key) {
                //Return given key only
                return this.fields[key].getValue();
            } else {
                //Return entire form data
                var schema = this.schema,
                    fields = this.fields
                    obj = {};

                _.each(fields, function(field) {
                    obj[field.key] = field.getValue();
                });

                return obj;
            }
        },
        
        /**
         * Update field values, referenced by key
         * @param {Object}  New values to set
         */
        setValue: function(data) {
            for (var key in data) {
                this.fields[key].setValue(data[key]);
            }
        },

        /**
         * Override default remove function in order to remove embedded views
         */
        remove: function() {
            var fields = this.fields;
            
            for (var key in fields) {
                fields[key].remove();
            }

            Backbone.View.prototype.remove.call(this);
        }

    });


    var Field = Backbone.View.extend({
      
        template: templates.field,

        /**
         * @param {Object}  Options
         *      Required:
         *          key     {String} : The model attribute key
         *      Optional:
         *          schema  {Object} : Schema for the field
         *          value       {Mixed} : Pass value when not using a model. Use getValue() to get out value
         *          model       {Backbone.Model} : Use instead of value, and use commit().
         *          idPrefix    {String} : Prefix to add to the editor DOM element's ID
         */
        initialize: function(options) {
            this.key = options.key;
            this.schema = options.schema || {};
            this.value = options.value;
            this.model = options.model;
            this.idPrefix = options.idPrefix || '';

            //Set schema defaults
            var schema = this.schema;
            if (!schema.type) schema.type = 'Text';
            if (!schema.title) schema.title = helpers.keyToTitle(this.key);
        },

        render: function() {
            var schema = this.schema;

            //Standard options that will go to all editors
            var options = {
                key: this.key,
                schema: schema,
                idPrefix: this.idPrefix,
                id: this.idPrefix + this.key
            };

            //Decide on data delivery type to pass to editors
            if (this.model)
                options.model = this.model;
            else
                options.value = this.value;

            //Decide on the editor to use
            var editor = this.editor = helpers.createEditor(schema.type, options);
            
            //Create the element
            var $field = $(this.template({
                key: this.key,
                title: schema.title,
                id: editor.id,
                type: schema.type,
                editor: '<div class="bbf-placeholder"></div>'
            }));
            
            var $editorContainer = $('.bbf-placeholder', $field).parent();
            $editorContainer.html('');
            
            $editorContainer.append(editor.render().el);
            
            this.setElement($field);

            return this;
        },

        /**
         * Validate the value from the editor
         */
        validate: function() {
            return this.editor.validate();
        },

        /**
         * Update the model with the new value from the editor
         */
        commit: function() {
            return this.editor.commit();
        },

        /**
         * Get the value from the editor
         * @return {Mixed}
         */
        getValue: function() {
            return this.editor.getValue();
        },
        
        /**
         * Set/change the value of the editor
         */
        setValue: function(value) {
            this.editor.setValue(value);
        },

        logValue: function() {
            console.log(this.getValue());
        },

        remove: function() {
            this.editor.remove();

            Backbone.View.prototype.remove.call(this);
        }

    });




    //========================================================================
    //EDITORS
    //========================================================================

    var editors = {};

    /**
     * Base editor (interface). To be extended, not used directly

     * @param {Object}  Options
     *      Optional:
     *         model   {Backbone.Model} : Use instead of value, and use commit().
     *         key     {String} : The model attribute key. Required when using 'model'
     *         value   {String} : When not using a model. If neither provided, defaultValue will be used.
     *         schema  {Object} : May be required by some editors
     */
    editors.Base = Backbone.View.extend({

        defaultValue: null,

        initialize: function(options) {
            var options = options || {};

            if (options.model) {
                if (!options.key) throw "Missing option: 'key'";

                this.model = options.model;
                this.key = options.key;

                this.value = this.model.get(this.key);
            }
            else if (options.value)
                this.value = options.value;
            
            if (this.value === undefined) this.value = this.defaultValue;

            this.schema = options.schema || {};
            this.validators = options.validators || this.schema.validators;
        },

        getValue: function() {
            throw 'Not implemented. Extend and override this method.';
        },
        
        setValue: function() {
            throw 'Not implemented. Extend and override this method.';
        },

        /**
         * Check the validity of a particular field
         */
        validate: function () {
            var $el = this.$el,
                error = null,
                value = this.getValue();

            if (this.validators) {
                _(this.validators).each(function(validator) {
                    if (!error) {
                        error = helpers.getValidator(validator)(value);
                    }
                });
            }

            if (!error && this.model && this.model.validate) {
                var change = {};
                change[this.key] = value;
                error = this.model.validate(change);
            }

            if (error) {
                $el.addClass('bbf-error');
            } else {
                $el.removeClass('bbf-error');
            }

            return error;
        },

        /**
         * Update the model with the new value from the editor
         *
         * @return {Error|null} Validation error or null
         */
        commit: function() {
            var error = null;
            var change = {};
            change[this.key] = this.getValue();
            this.model.set(change, {
                error: function(model, e) {
                    error = e;
                }
            });

            return error;
        }

    });

    editors.Text = editors.Base.extend({

        tagName: 'input',
        
        defaultValue: '',
        
        initialize: function(options) {            
            editors.Base.prototype.initialize.call(this, options);
            
            //Allow customising text type (email, phone etc.) for HTML5 browsers
            var type = 'text';
            
            if (this.schema && this.schema.dataType) type = this.schema.dataType;

            this.$el.attr('type', type);
        },

        /**
         * Adds the editor to the DOM
         */
        render: function() {
            this.setValue(this.value);

            return this;
        },

        /**
         * Returns the current editor value
         * @return {String}
         */
        getValue: function() {
            return this.$el.val();
        },
        
        /**
         * Sets the value of the form element
         * @param {String}
         */
        setValue: function(value) { 
           this.$el.val(value);
        }

    });


    /**
     * Normal text input that only allows a number. Letters etc. are not entered
     */
    editors.Number = editors.Text.extend({

        defaultValue: 0,

        events: {
            'keypress': 'onKeyPress'
        },

        /**
         * Check value is numeric
         */
        onKeyPress: function(event) {        
            var newVal = this.$el.val() + String.fromCharCode(event.keyCode);

            var numeric = /^[0-9]*\.?[0-9]*?$/.test(newVal);

            if (!numeric) event.preventDefault();
        },

        getValue: function() {        
            var value = this.$el.val();
            
            return value === "" ? null : parseFloat(value, 10);
        },
        
        setValue: function(value) {
            value = value === null ? null : parseFloat(value, 10);
            
            editors.Text.prototype.setValue.call(this, value);
        }

    });


    editors.Password = editors.Text.extend({

        initialize: function(options) {
            editors.Text.prototype.initialize.call(this, options);

            this.$el.attr('type', 'password');
        }

    });


    editors.TextArea = editors.Text.extend({

       tagName: 'textarea'

    });
    
    
    editors.Checkbox = editors.Base.extend({
        
        defaultValue: false,
        
        tagName: 'input',
        
        initialize: function(options) {
            editors.Base.prototype.initialize.call(this, options);
            
            this.$el.attr('type', 'checkbox');
        },

        /**
         * Adds the editor to the DOM
         */
        render: function() {
            this.setValue(this.value);

            return this;
        },
        
        getValue: function() {
            return this.$el.attr('checked') ? true : false;
        },
        
        setValue: function(value) {
            if (value) {
                this.$el.attr('checked', true);
            }
        }
        
    });
    
    
    editors.Hidden = editors.Base.extend({
        
        defaultValue: '',

        initialize: function(options) {
            editors.Text.prototype.initialize.call(this, options);

            this.$el.attr('type', 'hidden');
        },
        
        getValue: function() {
            return this.value;
        },
        
        setValue: function(value) {
            this.value = value;
        }

    });


    /**
     * Renders a <select> with given options
     *
     * Requires an 'options' value on the schema.
     *  Can be an array of options, a function that calls back with the array of options, a string of HTML
     *  or a Backbone collection. If a collection, the models must implement a toString() method
     */
    editors.Select = editors.Base.extend({

        tagName: 'select',

        initialize: function(options) {
            editors.Base.prototype.initialize.call(this, options);

            if (!this.schema || !this.schema.options)
                throw "Missing required 'schema.options'";
        },

        render: function() {
            var options = this.schema.options,
                self = this;

            //If a collection was passed, check if it needs fetching
            if (options instanceof Backbone.Collection) {
                var collection = options;

                //Don't do the fetch if it's already populated
                if (collection.length > 0) {
                    self.renderOptions(options);
                } else {
                    collection.fetch({
                        success: function(collection) {
                            self.renderOptions(options);
                        }
                    });
                }
            }

            //If a function was passed, run it to get the options
            else if (_.isFunction(options)) {
                options(function(result) {
                    self.renderOptions(result);
                });
            }

            //Otherwise, ready to go straight to renderOptions
            else {
                self.renderOptions(options);
            }

            return this;
        },

        /**
         * Adds the <option> html to the DOM
         * @param {Mixed}   Options as a simple array e.g. ['option1', 'option2']
         *                      or as an array of objects e.g. [{val: 543, label: 'Title for object 543'}]
         *                      or as a string of <option> HTML to insert into the <select>
         */
        renderOptions: function(options) {
            var $select = this.$el,
                html;

            //Accept string of HTML
            if (_.isString(options)) {
                html = options;
            }

            //Or array
            else if (_.isArray(options)) {
                html = this._arrayToHtml(options);
            }

            //Or Backbone collection
            else if (options instanceof Backbone.Collection) {
                html = this._collectionToHtml(options)
            }

            //Insert options
            $select.html(html);

            //Select correct option
            this.setValue(this.value);
        },

        getValue: function() {
            return this.$el.val();
        },
        
        setValue: function(value) {
            this.$el.val(value);
        },

        /**
         * Transforms a collection into HTML ready to use in the renderOptions method
         * @param {Backbone.Collection} 
         * @return {String}
         */
        _collectionToHtml: function(collection) {
            //Convert collection to array first
            var array = [];
            collection.each(function(model) {
                array.push({ val: model.id, label: model.toString() });
            });

            //Now convert to HTML
            var html = this._arrayToHtml(array);

            return html;
        },

        /**
         * Create the <option> HTML
         * @param {Array}   Options as a simple array e.g. ['option1', 'option2']
         *                      or as an array of objects e.g. [{val: 543, label: 'Title for object 543'}]
         * @return {String} HTML
         */
        _arrayToHtml: function(array) {
            var html = [];

            //Generate HTML
            _.each(array, function(option) {
                if (_.isObject(option)) {
                    var val = option.val ? option.val : '';
                    html.push('<option value="'+val+'">'+option.label+'</option>');
                }
                else {
                    html.push('<option>'+option+'</option>');
                }
            });

            return html.join('');
        }

    });




    /**
     * Renders a <ul> with given options represented as <li> objects containing radio buttons
     *
     * Requires an 'options' value on the schema.
     *  Can be an array of options, a function that calls back with the array of options, a string of HTML
     *  or a Backbone collection. If a collection, the models must implement a toString() method
     */
    editors.Radio = editors.Select.extend({

        tagName: 'ul',
        className: 'bbf-radio',

        getValue: function() {
            return this.$el.find('input[type=radio]:checked').val();
        },

        setValue: function(value) {
            this.$el.find('input[type=radio][value='+value+']').attr('checked', true);
        },

        /**
         * Create the radio list HTML
         * @param {Array}   Options as a simple array e.g. ['option1', 'option2']
         *                      or as an array of objects e.g. [{val: 543, label: 'Title for object 543'}]
         * @return {String} HTML
         */
        _arrayToHtml: function (array) {
            var html = [];
            var self = this;

            _.each(array, function(option, index) {
                var itemHtml = '<li>';
                if (_.isObject(option)) {
                    var val = option.val ? option.val : '';
                    itemHtml += ('<input type="radio" name="'+self.id+'" value="'+val+'" id="'+self.id+'-'+index+'" />')
                    itemHtml += ('<label for="'+self.id+'-'+index+'">'+option.label+'</label>')
                }
                else {
                    itemHtml += ('<input type="radio" name="'+self.id+'" value="'+option+'" id="'+self.id+'-'+index+'" />')
                    itemHtml += ('<label for="'+self.id+'-'+index+'">'+option+'</label>')
                }
                itemHtml += '</li>';
                html.push(itemHtml);
            });

            return html.join('');
        }

    });




    /**
     * Renders a <ul> with given options represented as <li> objects containing checkboxes
     *
     * Requires an 'options' value on the schema.
     *  Can be an array of options, a function that calls back with the array of options, a string of HTML
     *  or a Backbone collection. If a collection, the models must implement a toString() method
     */
    editors.Checkboxes = editors.Select.extend({

        tagName: 'ul',
        className: 'bbf-checkboxes',

        getValue: function() {
            var values = [];
            this.$el.find('input[type=checkbox]:checked').each(function() {
                values.push($(this).val());
            });
            return values;
        },

        setValue: function(value) {
            var self = this;
            _.each(value, function(val) {
                self.$el.find('input[type=checkbox][value="'+val+'"]').attr('checked', true);
            });
        },

        /**
         * Create the checkbox list HTML
         * @param {Array}   Options as a simple array e.g. ['option1', 'option2']
         *                      or as an array of objects e.g. [{val: 543, label: 'Title for object 543'}]
         * @return {String} HTML
         */
        _arrayToHtml: function (array) {
            var html = [];
            var self = this;

            _.each(array, function(option, index) {
                var itemHtml = '<li>';
                if (_.isObject(option)) {
                    var val = option.val ? option.val : '';
                    itemHtml += ('<input type="checkbox" name="'+self.id+'" value="'+val+'" id="'+self.id+'-'+index+'" />')
                    itemHtml += ('<label for="'+self.id+'-'+index+'">'+option.label+'</label>')
                }
                else {
                    itemHtml += ('<input type="checkbox" name="'+self.id+'" value="'+option+'" id="'+self.id+'-'+index+'" />')
                    itemHtml += ('<label for="'+self.id+'-'+index+'">'+option+'</label>')
                }
                itemHtml += '</li>';
                html.push(itemHtml);
            });

            return html.join('');
        }

    });




    /**
     * Creates a child form. For editing Javascript objects
     * 
     * Special options:
     *   schema.subSchema:    Subschema for object.
     *   idPrefix, 
     */
    editors.Object = editors.Base.extend({

        className: 'bbf-object',

        defaultValue: {},

        initialize: function(options) {
            editors.Base.prototype.initialize.call(this, options);

            if (!this.schema.subSchema)
                throw "Missing required 'schema.subSchema' option for Object editor";

            this.idPrefix = options.idPrefix || '';
        },

        render: function() {
            var $el = this.$el,
                data = this.value || {},
                key = this.key,
                schema = this.schema,
                objSchema = schema.subSchema;

            this.form = new Form({
                schema: objSchema,
                data: data,
                idPrefix: this.idPrefix + this.key + '_'
            });

            //Render form
            $el.html(this.form.render().el);

            return this;
        },

        getValue: function() {
            return this.form.getValue();
        },
        
        setValue: function(value) {
            this.value = value;
            
            this.render();
        },

        remove: function() {
            this.form.remove();

            Backbone.View.prototype.remove.call(this);
        }

    });


    /**
     * Creates a child form. For editing nested Backbone models
     * 
     * Special options:
     *   schema.model:   Embedded model constructor
     */
    editors.NestedModel = editors.Object.extend({

        initialize: function(options) {
            editors.Base.prototype.initialize.call(this, options);

            if (!options.schema.model)
                throw 'Missing required "schema.model" option for NestedModel editor';

            this.idPrefix = options.idPrefix || '';
        },

        render: function() {
            var data = this.value || {},
                key = this.key,
                nestedModel = this.schema.model,
                nestedModelSchema = (nestedModel).prototype.schema;

            this.form = new Form({
                schema: nestedModelSchema,
                model: new nestedModel(data),
                idPrefix: this.idPrefix + this.key + '_'
            });

            //Render form
            this.$el.html(this.form.render().el);

            return this;
        },

        /**
         * Update the embedded model, checking for nested validation errors and pass them up
         * Then update the main model if all OK
         *
         * @return {Error|null} Validation error or null
         */
        commit: function() {
            var error = this.form.commit();
            if (error) {
                this.$el.addClass('error');
                return error;
            }

            return editors.Object.prototype.commit.call(this);
        }

    });
    
    
    //Exports
    Form.helpers = helpers;
    Form.Field = Field;
    Form.editors = editors;
    Form.validators = validators;
    Backbone.Form = Form;
    
    //For use in NodeJS
    if (typeof module != 'undefined') module.exports = Form

}(jQuery));
