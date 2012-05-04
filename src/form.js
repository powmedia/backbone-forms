
//==================================================================================================
//FORM
//==================================================================================================
  
var Form = (function() {

  return Backbone.View.extend({
    
    //Field views
    fields: null,

    /**
     * @param {Object}  Options
     *      Required:
     *          schema  {Array}
     *      Optional:
     *          model   {Backbone.Model} : Use instead of data, and use commit().
     *          data    {Array} : Pass this when not using a model. Use getValue() to get out value
     *          fields  {Array} : Keys of fields to include in the form, in display order (default: all fields)
     *          fieldsets {Array} : Allows choosing and ordering fields within fieldsets.
     *          idPrefix {String} : Prefix for editor IDs. If undefined, the model's CID is used.
     *          template {String} : Template to use. Default to 'form'.
     */
    initialize: function(options) { 
      //Get the schema
      this.schema = (function() {
        if (options.schema) return options.schema;
      
        var model = options.model;
        if (!model) throw new Error('Could not find schema');
      
        if (_.isFunction(model.schema)) return model.schema();
      
        return model.schema;
      })();
      
      //Handle other options
      this.model = options.model;
      this.data = options.data;
      this.fieldsToRender = options.fields || _.keys(this.schema);
      this.fieldsets = options.fieldsets;
      this.templateName = options.template || 'form';
      
      //Stores all Field views
      this.fields = {};
    },

    /**
     * Renders the form and all fields
     */
    render: function() {
      var self = this,
          fieldsets = this.fieldsets,
          templates = Form.templates;
      
      //Create el from template
      var $form = $(templates[this.templateName]({
        fieldsets: '<div class="bbf-placeholder"></div>'
      }));

      //Get a reference to where fieldsets should go
      var $fieldsetContainer = $('.bbf-placeholder', $form);

      if(!fieldsets) {
        fieldsets = [{fields: this.fieldsToRender}]
      }

      //TODO: Update handling of fieldsets
      _.each(fieldsets, function(fs) {
        if (_(fs).isArray()) {
          fs = {'fields': fs};
        }

        //Concatenating HTML as strings won't work so we need to insert field elements into a placeholder
        var $fieldset = $(templates.fieldset(_.extend({}, fs, {
          legend: (fs.legend) ? '<legend>' + fs.legend + '</legend>' : '',
          fields: '<div class="bbf-placeholder"></div>'
        })));

        var $fieldsContainer = $('.bbf-placeholder', $fieldset);

        self.renderFields(fs.fields, $fieldsContainer);

        $fieldsContainer = $fieldsContainer.children().unwrap()

        $fieldsetContainer.append($fieldset);
      });

      $fieldsetContainer.children().unwrap()

      this.setElement($form);

      return this;
    },

    /**
     * Render a list of fields. Returns the rendered Field object.
     * @param {Array}           Fields to render
     * @param {jQuery}          Wrapped DOM element where field elemends will go
     */
    renderFields: function (fieldsToRender, $container) {
      var self = this,
          schema = this.schema,
          model = this.model,
          data = this.data,
          fields = this.fields,
          getNested = Form.helpers.getNested;
      
      //Create form fields
      _.each(fieldsToRender, function(key) {
        //Get nested schema
        var itemSchema = (function() {
          //Return a normal key or path key
          if (schema[key]) return schema[key];

          //Return a nested schema, i.e. Object
          var path = key.replace(/\./g, '.subSchema.');
          return getNested(schema, path);
        })();

        if (!itemSchema) throw "Field '"+key+"' not found in schema";

        var options = {
          form: self,
          key: key,
          schema: itemSchema,
          idPrefix: self.options.idPrefix
        };

        if (model) {
          options.model = model;
        } else if (data) {
          options.value = data[key];
        } else {
          options.value = null;
        }

        var field = new Form.Field(options);

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
      var self = this,
          fields = this.fields,
          model = this.model,
          errors = {};

      //Collect errors from schema validation
      _.each(fields, function(field) {
        var error = field.validate();
        if (error) {
          errors[field.key] = error;
        }
      });

      //Get errors from default Backbone model validator
      if (model && model.validate) {
        var modelErrors = model.validate(this.getValue());
        
        if (modelErrors) {
          var isDictionary = _.isObject(modelErrors) && !_.isArray(modelErrors);
          
          //If errors are not in object form then just store on the error object
          if (!isDictionary) {
            errors._others = errors._others || [];
            errors._others.push(modelErrors);
          }
          
          //Merge programmatic errors (requires model.validate() to return an object e.g. { fieldKey: 'error' })
          if (isDictionary) {
            _.each(modelErrors, function(val, key) {
              //Set error on field if there isn't one already
              if (self.fields[key] && !errors[key]) {
                self.fields[key].setError(val);
              }
              
              else {
                //Otherwise add to '_others' key
                errors._others = errors._others || [];
                var tmpErr = {};
                tmpErr[key] = val;
                errors._others.push(tmpErr);
              }
            });
          }
        }
      }

      return _.isEmpty(errors) ? null : errors;
    },

    /**
     * Update the model with all latest values.
     *
     * @return {Object}  Validation errors
     */
    commit: function() {
      //Validate
      var errors = this.validate();
      if (errors) return errors;

      //Commit
      var modelError;
      this.model.set(this.getValue(), {
        error: function(model, e) {
          modelError = e;
        }
      });
      
      if (modelError) return modelError;
    },

    /**
     * Get all the field values as an object.
     * Use this method when passing data instead of objects
     * 
     * @param {String}  To get a specific field value pass the key name
     */
    getValue: function(key) {
      //Return only given key if specified
      if (key) return this.fields[key].getValue();
      
      //Otherwise return entire form      
      var values = {};
      _.each(this.fields, function(field) {
        values[field.key] = field.getValue();
      });

      return values;
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

})();
