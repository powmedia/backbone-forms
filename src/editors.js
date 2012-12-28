
//========================================================================
//EDITORS
//========================================================================

Form.editors = (function() {

  var helpers = Form.helpers;

  var editors = {};

  /**
   * Base editor (interface). To be extended, not used directly
   *
   * @param {Object}  Options
   *      Optional:
   *         model   {Backbone.Model} : Use instead of value, and use commit().
   *         key     {String} : The model attribute key. Required when using 'model'
   *         value   {String} : When not using a model. If neither provided, defaultValue will be used.
   *         schema  {Object} : May be required by some editors
   */
  editors.Base = Backbone.View.extend({

    defaultValue: null,
    
    hasFocus: false,

    initialize: function(options) {
      var options = options || {};

      if (options.model) {
        if (!options.key) throw "Missing option: 'key'";

        this.model = options.model;

        this.value = this.model.get(options.key);
      }
      else if (options.value) {
        this.value = options.value;
      }
      
      if (this.value === undefined) this.value = this.defaultValue;

      this.key = options.key;
      this.form = options.form;
      this.schema = options.schema || {};
      this.validators = options.validators || this.schema.validators;
      
      //Main attributes
      this.$el.attr('name', this.getName());
      
      //Add custom CSS class names
      if (this.schema.editorClass) this.$el.addClass(this.schema.editorClass);
      
      //Add custom attributes
      if (this.schema.editorAttrs) this.$el.attr(this.schema.editorAttrs);
    },

    getValue: function() {
      throw 'Not implemented. Extend and override this method.';
    },
    
    setValue: function() {
      throw 'Not implemented. Extend and override this method.';
    },
    
    focus: function() {
      throw 'Not implemented. Extend and override this method.';
    },
    
    blur: function() {
      throw 'Not implemented. Extend and override this method.';
    },

    /**
     * Get the value for the form input 'name' attribute
     *
     * @return {String}
     * 
     * @api private
     */
    getName: function() {
      var key = this.key || '';

      //Replace periods with underscores (e.g. for when using paths)
      return key.replace(/\./g, '_');
    },
    
    /**
     * Update the model with the current value
     * NOTE: The method is defined on the editors so that they can be used independently of fields
     *
     * @return {Mixed} error
     */
    commit: function() {
      var error = this.validate();
      if (error) return error;
      
      this.model.set(this.key, this.getValue(), {
        error: function(model, e) {
          error = e;
        }
      });
      
      if (error) return error;
    },
    
    /**
     * Check validity
     * NOTE: The method is defined on the editors so that they can be used independently of fields
     * 
     * @return {String}
     */
    validate: function() {
      var $el = this.$el,
          error = null,
          value = this.getValue(),
          formValues = this.form ? this.form.getValue() : {},
          validators = this.validators,
          getValidator = Form.helpers.getValidator;

      if (validators) {
        //Run through validators until an error is found
        _.every(validators, function(validator) {
          error = getValidator(validator)(value, formValues);

          return error ? false : true;
        });
      }

      return error;
    },
    
    
    trigger: function(event) {
      if (event === 'focus') {
        this.hasFocus = true;
      }
      else if (event === 'blur') {
        this.hasFocus = false;
      }
      
      return Backbone.View.prototype.trigger.apply(this, arguments);
    }
  });


  //TEXT
  editors.Text = editors.Base.extend({

    tagName: 'input',
    
    defaultValue: '',
    
    previousValue: '',
    
    events: {
      'keyup':    'determineChange',
      'keypress': function(event) {
        var self = this;
        setTimeout(function() {
          self.determineChange();
        }, 0);
      },
      'select':   function(event) {
        this.trigger('select', this);
      },
      'focus':    function(event) {
        this.trigger('focus', this);
      },
      'blur':     function(event) {
        this.trigger('blur', this);
      }
    },
    
    initialize: function(options) {
      editors.Base.prototype.initialize.call(this, options);
      
      var schema = this.schema;
      
      //Allow customising text type (email, phone etc.) for HTML5 browsers
      var type = 'text';
      
      if (schema && schema.editorAttrs && schema.editorAttrs.type) type = schema.editorAttrs.type;
      if (schema && schema.dataType) type = schema.dataType;

      this.$el.attr('type', type);
    },

    /**
     * Adds the editor to the DOM
     */
    render: function() {
      this.setValue(this.value);

      return this;
    },
    
    determineChange: function(event) {
      var currentValue = this.$el.val();
      var changed = (currentValue !== this.previousValue);
      
      if (changed) {
        this.previousValue = currentValue;
        
        this.trigger('change', this);
      }
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
    },
    
    focus: function() {
      if (this.hasFocus) return;

      this.$el.focus();
    },
    
    blur: function() {
      if (!this.hasFocus) return;

      this.$el.blur();
    },
    
    select: function() {
      this.$el.select();
    }

  });


  /**
   * NUMBER
   * Normal text input that only allows a number. Letters etc. are not entered
   */
  editors.Number = editors.Text.extend({

    defaultValue: 0,

    events: _.extend({}, editors.Text.prototype.events, {
      'keypress': 'onKeyPress'
    }),

    initialize: function(options) {
      editors.Text.prototype.initialize.call(this, options);

      this.$el.attr('type', 'number');
      this.$el.attr('step', 'any');
    },

    /**
     * Check value is numeric
     */
    onKeyPress: function(event) {
      var self = this,
          delayedDetermineChange = function() {
            setTimeout(function() {
              self.determineChange();
            }, 0);
          };
          
      //Allow backspace
      if (event.charCode === 0) {
        delayedDetermineChange();
        return;
      }
      
      //Get the whole new value so that we can prevent things like double decimals points etc.
      var newVal = this.$el.val() + String.fromCharCode(event.charCode);

      var numeric = /^[0-9]*\.?[0-9]*?$/.test(newVal);

      if (numeric) {
        delayedDetermineChange();
      }
      else {
        event.preventDefault();
      }
    },

    getValue: function() {        
      var value = this.$el.val();
      
      return value === "" ? null : parseFloat(value, 10);
    },
    
    setValue: function(value) {
      value = (function() {
        if (_.isNumber(value)) return value;

        if (_.isString(value) && value !== '') return parseFloat(value, 10);

        return null;
      })();

      if (_.isNaN(value)) value = null;
      
      editors.Text.prototype.setValue.call(this, value);
    }

  });


  //PASSWORD
  editors.Password = editors.Text.extend({

    initialize: function(options) {
      editors.Text.prototype.initialize.call(this, options);

      this.$el.attr('type', 'password');
    }

  });


  //TEXTAREA
  editors.TextArea = editors.Text.extend({

    tagName: 'textarea'

  });
  
  
  //CHECKBOX
  editors.Checkbox = editors.Base.extend({
      
    defaultValue: false,
    
    tagName: 'input',
    
    events: {
      'click':  function(event) {
        this.trigger('change', this);
      },
      'focus':  function(event) {
        this.trigger('focus', this);
      },
      'blur':   function(event) {
        this.trigger('blur', this);
      }
    },
    
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
      return this.$el.prop('checked');
    },
    
    setValue: function(value) {
      if (value) {
        this.$el.prop('checked', true);
      }
    },
    
    focus: function() {
      if (this.hasFocus) return;

      this.$el.focus();
    },
    
    blur: function() {
      if (!this.hasFocus) return;

      this.$el.blur();
    }
    
  });
  
  
  //HIDDEN
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
    },
    
    focus: function() {
      
    },
    
    blur: function() {
      
    }

  });


  /**
   * SELECT
   * 
   * Renders a <select> with given options
   *
   * Requires an 'options' value on the schema.
   *  Can be an array of options, a function that calls back with the array of options, a string of HTML
   *  or a Backbone collection. If a collection, the models must implement a toString() method
   */
  editors.Select = editors.Base.extend({

    tagName: 'select',
    
    events: {
      'change': function(event) {
        this.trigger('change', this);
      },
      'focus':  function(event) {
        this.trigger('focus', this);
      },
      'blur':   function(event) {
        this.trigger('blur', this);
      }
    },

    initialize: function(options) {
      editors.Base.prototype.initialize.call(this, options);

      if (!this.schema || !this.schema.options) throw "Missing required 'schema.options'";
    },

    render: function() {
      this.setOptions(this.schema.options);

      return this;
    },

    /**
     * Sets the options that populate the <select>
     *
     * @param {Mixed} options
     */
    setOptions: function(options) {
      var self = this;

      //If a collection was passed, check if it needs fetching
      if (options instanceof Backbone.Collection) {
        var collection = options;

        //Don't do the fetch if it's already populated
        if (collection.length > 0) {
          this.renderOptions(options);
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
        this.renderOptions(options);
      }
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
        html = this._collectionToHtml(options);
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
    
    focus: function() {
      if (this.hasFocus) return;

      this.$el.focus();
    },
    
    blur: function() {
      if (!this.hasFocus) return;

      this.$el.blur();
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
          var val = (option.val || option.val === 0) ? option.val : '';
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
   * RADIO
   * 
   * Renders a <ul> with given options represented as <li> objects containing radio buttons
   *
   * Requires an 'options' value on the schema.
   *  Can be an array of options, a function that calls back with the array of options, a string of HTML
   *  or a Backbone collection. If a collection, the models must implement a toString() method
   */
  editors.Radio = editors.Select.extend({

    tagName: 'ul',
    className: 'bbf-radio',
    
    events: {
      'change input[type=radio]': function() {
        this.trigger('change', this);
      },
      'focus input[type=radio]': function() {
        if (this.hasFocus) return;
        this.trigger('focus', this);
      },
      'blur input[type=radio]': function() {
        if (!this.hasFocus) return;
        var self = this;
        setTimeout(function() {
          if (self.$('input[type=radio]:focus')[0]) return;
          self.trigger('blur', self);
        }, 0);
      }
    },

    getValue: function() {
      return this.$('input[type=radio]:checked').val();
    },

    setValue: function(value) {
      this.$('input[type=radio]').val([value]);
    },
    
    focus: function() {
      if (this.hasFocus) return;
      
      var checked = this.$('input[type=radio]:checked');
      if (checked[0]) {
        checked.focus();
        return;
      }
      
      this.$('input[type=radio]').first().focus();
    },
    
    blur: function() {
      if (!this.hasFocus) return;
      
      this.$('input[type=radio]:focus').blur();
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
          var val = (option.val || option.val === 0) ? option.val : '';
          itemHtml += ('<input type="radio" name="'+self.id+'" value="'+val+'" id="'+self.id+'-'+index+'" />');
          itemHtml += ('<label for="'+self.id+'-'+index+'">'+option.label+'</label>');
        }
        else {
          itemHtml += ('<input type="radio" name="'+self.id+'" value="'+option+'" id="'+self.id+'-'+index+'" />');
          itemHtml += ('<label for="'+self.id+'-'+index+'">'+option+'</label>');
        }
        itemHtml += '</li>';
        html.push(itemHtml);
      });

      return html.join('');
    }

  });



  /**
   * CHECKBOXES
   * Renders a <ul> with given options represented as <li> objects containing checkboxes
   *
   * Requires an 'options' value on the schema.
   *  Can be an array of options, a function that calls back with the array of options, a string of HTML
   *  or a Backbone collection. If a collection, the models must implement a toString() method
   */
  editors.Checkboxes = editors.Select.extend({

    tagName: 'ul',
    className: 'bbf-checkboxes',
    
    events: {
      'click input[type=checkbox]': function() {
        this.trigger('change', this);
      },
      'focus input[type=checkbox]': function() {
        if (this.hasFocus) return;
        this.trigger('focus', this);
      },
      'blur input[type=checkbox]':  function() {
        if (!this.hasFocus) return;
        var self = this;
        setTimeout(function() {
          if (self.$('input[type=checkbox]:focus')[0]) return;
          self.trigger('blur', self);
        }, 0);
      }
    },

    getValue: function() {
      var values = [];
      this.$('input[type=checkbox]:checked').each(function() {
        values.push($(this).val());
      });
      return values;
    },

    setValue: function(values) {
      if (!_.isArray(values)) values = [values];
      this.$('input[type=checkbox]').val(values);
    },
    
    focus: function() {
      if (this.hasFocus) return;
      
      this.$('input[type=checkbox]').first().focus();
    },
    
    blur: function() {
      if (!this.hasFocus) return;
      
      this.$('input[type=checkbox]:focus').blur();
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
          var val = (option.val || option.val === 0) ? option.val : '';
          itemHtml += ('<input type="checkbox" name="'+self.id+'" value="'+val+'" id="'+self.id+'-'+index+'" />');
          itemHtml += ('<label for="'+self.id+'-'+index+'">'+option.label+'</label>');
        }
        else {
          itemHtml += ('<input type="checkbox" name="'+self.id+'" value="'+option+'" id="'+self.id+'-'+index+'" />');
          itemHtml += ('<label for="'+self.id+'-'+index+'">'+option+'</label>');
        }
        itemHtml += '</li>';
        html.push(itemHtml);
      });

      return html.join('');
    }

  });



  /**
   * OBJECT
   * 
   * Creates a child form. For editing Javascript objects
   * 
   * @param {Object} options
   * @param {Object} options.schema             The schema for the object
   * @param {Object} options.schema.subSchema   The schema for the nested form
   */
  editors.Object = editors.Base.extend({
    //Prevent error classes being set on the main control; they are internally on the individual fields
    hasNestedForm: true,

    className: 'bbf-object',

    initialize: function(options) {
      //Set default value for the instance so it's not a shared object
      this.value = {};

      //Init
      editors.Base.prototype.initialize.call(this, options);

      //Check required options
      if (!this.schema.subSchema) throw new Error("Missing required 'schema.subSchema' option for Object editor");
    },

    render: function() {      
      //Create the nested form
      this.form = new Form({
        schema: this.schema.subSchema,
        data: this.value,
        idPrefix: this.id + '_',
        fieldTemplate: 'nestedField'
      });

      this._observeFormEvents();

      this.$el.html(this.form.render().el);
      
      if (this.hasFocus) this.trigger('blur', this);
      
      return this;
    },

    getValue: function() {
      if (this.form) return this.form.getValue();

      return this.value;
    },
    
    setValue: function(value) {
      this.value = value;
      
      this.render();
    },
    
    focus: function() {
      if (this.hasFocus) return;
      
      this.form.focus();
    },
    
    blur: function() {
      if (!this.hasFocus) return;
      
      this.form.blur();
    },

    remove: function() {
      this.form.remove();

      Backbone.View.prototype.remove.call(this);
    },
    
    validate: function() {
      return this.form.validate();
    },
    
    _observeFormEvents: function() {
      this.form.on('all', function() {
        // args = ["key:change", form, fieldEditor]
        var args = _.toArray(arguments);
        args[1] = this;
        // args = ["key:change", this=objectEditor, fieldEditor]
        
        this.trigger.apply(this, args);
      }, this);
    }

  });



  /**
   * NESTED MODEL
   * 
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
    },

    render: function() {
      var data = this.value || {},
          key = this.key,
          nestedModel = this.schema.model;

      //Wrap the data in a model if it isn't already a model instance
      var modelInstance = (data.constructor === nestedModel) ? data : new nestedModel(data);

      this.form = new Form({
        model: modelInstance,
        idPrefix: this.id + '_',
        fieldTemplate: 'nestedField'
      });

      this._observeFormEvents();

      //Render form
      this.$el.html(this.form.render().el);
      
      if (this.hasFocus) this.trigger('blur', this);

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



  /**
   * DATE
   *
   * Schema options
   * @param {Number|String} [options.schema.yearStart]  First year in list. Default: 100 years ago
   * @param {Number|String} [options.schema.yearEnd]    Last year in list. Default: current year
   *
   * Config options (if not set, defaults to options stored on the main Date class)
   * @param {Boolean} [options.showMonthNames]  Use month names instead of numbers. Default: true
   * @param {String[]} [options.monthNames]     Month names. Default: Full English names
   */
  editors.Date = editors.Base.extend({

    events: {
      'change select':  function() {
        this.updateHidden();
        this.trigger('change', this);
      },
      'focus select':   function() {
        if (this.hasFocus) return;
        this.trigger('focus', this);
      },
      'blur select':    function() {
        if (!this.hasFocus) return;
        var self = this;
        setTimeout(function() {
          if (self.$('select:focus')[0]) return;
          self.trigger('blur', self);
        }, 0);
      }
    },

    initialize: function(options) {
      options = options || {};

      editors.Base.prototype.initialize.call(this, options);

      var Self = editors.Date,
          today = new Date();

      //Option defaults
      this.options = _.extend({
        monthNames: Self.monthNames,
        showMonthNames: Self.showMonthNames
      }, options);

      //Schema defaults
      this.schema = _.extend({
        yearStart: today.getFullYear() - 100,
        yearEnd: today.getFullYear()
      }, options.schema || {});
            
      //Cast to Date
      if (this.value && !_.isDate(this.value)) {
        this.value = new Date(this.value);
      }
      
      //Set default date
      if (!this.value) {
        var date = new Date();
        date.setSeconds(0);
        date.setMilliseconds(0);
        
        this.value = date;
      }
    },

    render: function() {
      var options = this.options,
          schema = this.schema;

      var datesOptions = _.map(_.range(1, 32), function(date) {
        return '<option value="'+date+'">' + date + '</option>';
      });

      var monthsOptions = _.map(_.range(0, 12), function(month) {
        var value = options.showMonthNames ? options.monthNames[month] : (month + 1);
        return '<option value="'+month+'">' + value + '</option>';
      });

      var yearRange = schema.yearStart < schema.yearEnd ? 
        _.range(schema.yearStart, schema.yearEnd + 1) :
        _.range(schema.yearStart, schema.yearEnd - 1, -1);
      var yearsOptions = _.map(yearRange, function(year) {
        return '<option value="'+year+'">' + year + '</option>';
      });

      //Render the selects
      var $el = $(Form.templates.date({
        dates: datesOptions.join(''),
        months: monthsOptions.join(''),
        years: yearsOptions.join('')
      }));

      //Store references to selects
      this.$date = $el.find('select[data-type="date"]');
      this.$month = $el.find('select[data-type="month"]');
      this.$year = $el.find('select[data-type="year"]');

      //Create the hidden field to store values in case POSTed to server
      this.$hidden = $('<input type="hidden" name="'+this.key+'" />');
      $el.append(this.$hidden);

      //Set value on this and hidden field
      this.setValue(this.value);

      //Remove the wrapper tag
      this.setElement($el);
      this.$el.attr('id', this.id);
      
      if (this.hasFocus) this.trigger('blur', this);

      return this;
    },

    /**
    * @return {Date}   Selected date
    */
    getValue: function() {
      var year = this.$year.val(),
          month = this.$month.val(),
          date = this.$date.val();

      if (!year || !month || !date) return null;

      return new Date(year, month, date);
    },
    
    /**
     * @param {Date} date
     */
    setValue: function(date) {
      this.$date.val(date.getDate());
      this.$month.val(date.getMonth());
      this.$year.val(date.getFullYear());

      this.updateHidden();
    },
    
    focus: function() {
      if (this.hasFocus) return;
      
      this.$('select').first().focus();
    },
    
    blur: function() {
      if (!this.hasFocus) return;
      
      this.$('select:focus').blur();
    },

    /**
     * Update the hidden input which is maintained for when submitting a form
     * via a normal browser POST
     */
    updateHidden: function() {
      var val = this.getValue();
      if (_.isDate(val)) val = val.toISOString();

      this.$hidden.val(val);
    }

  }, {
    //STATICS

    //Whether to show month names instead of numbers
    showMonthNames: true,

    //Month names to use if showMonthNames is true
    //Replace for localisation, e.g. Form.editors.Date.monthNames = ['Janvier', 'Fevrier'...]
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  });


  /**
   * DATETIME
   * 
   * @param {Editor} [options.DateEditor]           Date editor view to use (not definition)
   * @param {Number} [options.schema.minsInterval]  Interval between minutes. Default: 15
   */
  editors.DateTime = editors.Base.extend({

    events: {
      'change select':  function() {
        this.updateHidden();
        this.trigger('change', this);
      },
      'focus select':   function() {
        if (this.hasFocus) return;
        this.trigger('focus', this);
      },
      'blur select':    function() {
        if (!this.hasFocus) return;
        var self = this;
        setTimeout(function() {
          if (self.$('select:focus')[0]) return;
          self.trigger('blur', self);
        }, 0);
      }
    },

    initialize: function(options) {
      options = options || {};

      editors.Base.prototype.initialize.call(this, options);

      //Option defaults
      this.options = _.extend({
        DateEditor: editors.DateTime.DateEditor
      }, options);

      //Schema defaults
      this.schema = _.extend({
        minsInterval: 15
      }, options.schema || {});

      //Create embedded date editor
      this.dateEditor = new this.options.DateEditor(options);

      this.value = this.dateEditor.value;
    },

    render: function() {
      function pad(n) {
        return n < 10 ? '0' + n : n;
      }

      var schema = this.schema;

      //Create options
      var hoursOptions = _.map(_.range(0, 24), function(hour) {
        return '<option value="'+hour+'">' + pad(hour) + '</option>';
      });

      var minsOptions = _.map(_.range(0, 60, schema.minsInterval), function(min) {
        return '<option value="'+min+'">' + pad(min) + '</option>';
      });

      //Render time selects
      var $el = $(Form.templates.dateTime({
        date: '<b class="bbf-tmp"></b>',
        hours: hoursOptions.join(),
        mins: minsOptions.join()
      }));

      //Include the date editor
      $el.find('.bbf-tmp').replaceWith(this.dateEditor.render().el);

      //Store references to selects
      this.$hour = $el.find('select[data-type="hour"]');
      this.$min = $el.find('select[data-type="min"]');

      //Get the hidden date field to store values in case POSTed to server
      this.$hidden = $el.find('input[type="hidden"]');
      
      //Set time
      this.setValue(this.value);

      this.setElement($el);
      this.$el.attr('id', this.id);
      
      if (this.hasFocus) this.trigger('blur', this);

      return this;
    },

    /**
    * @return {Date}   Selected datetime
    */
    getValue: function() {
      var date = this.dateEditor.getValue();

      var hour = this.$hour.val(),
          min = this.$min.val();

      if (!date || !hour || !min) return null;

      date.setHours(hour);
      date.setMinutes(min);

      return date;
    },
    
    setValue: function(date) {
      if (!_.isDate(date)) date = new Date(date);
      
      this.dateEditor.setValue(date);
      
      this.$hour.val(date.getHours());
      this.$min.val(date.getMinutes());

      this.updateHidden();
    },
    
    focus: function() {
      if (this.hasFocus) return;
      
      this.$('select').first().focus();
    },
    
    blur: function() {
      if (!this.hasFocus) return;
      
      this.$('select:focus').blur();
    },

    /**
     * Update the hidden input which is maintained for when submitting a form
     * via a normal browser POST
     */
    updateHidden: function() {
      var val = this.getValue();
      if (_.isDate(val)) val = val.toISOString();

      this.$hidden.val(val);
    },

    /**
     * Remove the Date editor before removing self
     */
    remove: function() {
      this.dateEditor.remove();

      editors.Base.prototype.remove.call(this);
    }

  }, {
    //STATICS

    //The date editor to use (constructor function, not instance)
    DateEditor: editors.Date
  });

  return editors;

})();
