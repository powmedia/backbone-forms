;(function() {

  var Form = Backbone.Form,
      editors = Form.editors;

  /**
   * LIST
   * 
   * An array editor. Creates a list of other editor items.
   *
   * Special options:
   * @param {String} [options.schema.itemType]          The editor type for each item in the list. Default: 'Text'
   * @param {String} [options.schema.confirmDelete]     Text to display in a delete confirmation dialog. If falsey, will not ask for confirmation.
   */
  editors.List = editors.Base.extend({
    
    events: {
      'click [data-action="add"]': function(event) {
        event.preventDefault();
        this.addItem(null, true);
      }
    },

    initialize: function(options) {
      editors.Base.prototype.initialize.call(this, options);

      var schema = this.schema;
      if (!schema) throw "Missing required option 'schema'";

      //List schema defaults
      this.schema = _.extend({
        listTemplate: 'list',
        listItemTemplate: 'listItem'
      }, schema);

      //Determine the editor to use
      this.Editor = (function() {
        var type = schema.itemType;

        //Default to Text
        if (!type) return editors.Text;

        //Use List-specific version if available
        if (editors.List[type]) return editors.List[type];

        //Or whichever was passed
        return editors[type];
      })();

      this.items = [];
    },

    render: function() {
      var self = this,
          value = this.value || [];

      //Create main element
      var $el = $(Form.templates[this.schema.listTemplate]({
        items: '<b class="bbf-tmp"></b>'
      }));

      //Store a reference to the list (item container)
      this.$list = $el.find('.bbf-tmp').parent().empty();

      //Add existing items
      if (value.length) {
        _.each(value, function(itemValue) {
          self.addItem(itemValue);
        });
      }

      //If no existing items create an empty one, unless the editor specifies otherwise
      else {
        if (!this.Editor.isAsync) this.addItem();
      }

      this.setElement($el);
      this.$el.attr('id', this.id);
      this.$el.attr('name', this.key);
            
      if (this.hasFocus) this.trigger('blur', this);
      
      return this;
    },

    /**
     * Add a new item to the list
     * @param {Mixed} [value]           Value for the new item editor
     * @param {Boolean} [userInitiated] If the item was added by the user clicking 'add'
     */
    addItem: function(value, userInitiated) {
      var self = this;

      //Create the item
      var item = new editors.List.Item({
        list: this,
        schema: this.schema,
        value: value,
        Editor: this.Editor,
        key: this.key
      }).render();
      
      var _addItem = function() {
        self.items.push(item);
        self.$list.append(item.el);
        
        item.editor.on('all', function(event) {
          if (event == 'change') return;

          // args = ["key:change", itemEditor, fieldEditor]
          args = _.toArray(arguments);
          args[0] = 'item:' + event;
          args.splice(1, 0, self);
          // args = ["item:key:change", this=listEditor, itemEditor, fieldEditor]

          editors.List.prototype.trigger.apply(this, args);
        }, self);

        item.editor.on('change', function() {
          if (!item.addEventTriggered) {
            item.addEventTriggered = true;
            this.trigger('add', this, item.editor);
          }
          this.trigger('item:change', this, item.editor);
          this.trigger('change', this);
        }, self);

        item.editor.on('focus', function() {
          if (this.hasFocus) return;
          this.trigger('focus', this);
        }, self);
        item.editor.on('blur', function() {
          if (!this.hasFocus) return;
          var self = this;
          setTimeout(function() {
            if (_.find(self.items, function(item) { return item.editor.hasFocus; })) return;
            self.trigger('blur', self);
          }, 0);
        }, self);
        
        if (userInitiated || value) {
          item.addEventTriggered = true;
        }
        
        if (userInitiated) {
          self.trigger('add', self, item.editor);
          self.trigger('change', self);
        }
      };

      //Check if we need to wait for the item to complete before adding to the list
      if (this.Editor.isAsync) {
        item.editor.on('readyToAdd', _addItem, this);
      }

      //Most editors can be added automatically
      else {
        _addItem();
      }
      
      return item;
    },

    /**
     * Remove an item from the list
     * @param {List.Item} item
     */
    removeItem: function(item) {
      //Confirm delete
      var confirmMsg = this.schema.confirmDelete;
      if (confirmMsg && !confirm(confirmMsg)) return;

      var index = _.indexOf(this.items, item);

      this.items[index].remove();
      this.items.splice(index, 1);
      
      if (item.addEventTriggered) {
        this.trigger('remove', this, item.editor);
        this.trigger('change', this);
      }

      if (!this.items.length && !this.Editor.isAsync) this.addItem();
    },

    getValue: function() {
      var values = _.map(this.items, function(item) {
        return item.getValue();
      });

      //Filter empty items
      return _.without(values, undefined, '');
    },

    setValue: function(value) {
      this.value = value;
      this.render();
    },
    
    focus: function() {
      if (this.hasFocus) return;

      if (this.items[0]) this.items[0].editor.focus();
    },
    
    blur: function() {
      if (!this.hasFocus) return;

      focusedItem = _.find(this.items, function(item) { return item.editor.hasFocus; });
      
      if (focusedItem) focusedItem.editor.blur();
    },

    /**
     * Override default remove function in order to remove item views
     */
    remove: function() {
      _.invoke(this.items, 'remove');

      editors.Base.prototype.remove.call(this);
    },
    
    /**
     * Run validation
     * 
     * @return {Object|Null}
     */
    validate: function() {
      if (!this.validators) return null;

      //Collect errors
      var errors = _.map(this.items, function(item) {
        return item.validate();
      });

      //Check if any item has errors
      var hasErrors = _.compact(errors).length ? true : false;
      if (!hasErrors) return null;

      //If so create a shared error
      var fieldError = {
        type: 'list',
        message: 'Some of the items in the list failed validation',
        errors: errors
      };

      return fieldError;
    }
  });


  /**
   * A single item in the list
   *
   * @param {editors.List} options.list The List editor instance this item belongs to
   * @param {Function} options.Editor   Editor constructor function
   * @param {String} options.key        Model key
   * @param {Mixed} options.value       Value
   * @param {Object} options.schema     Field schema
   */
  editors.List.Item = Backbone.View.extend({
    events: {
      'click [data-action="remove"]': function(event) {
        event.preventDefault();
        this.list.removeItem(this);
      },
      'keydown input[type=text]': function(event) {
        if(event.keyCode != 13) return;
        event.preventDefault();
        this.list.addItem();
        this.list.$list.find("> li:last input").focus();
      }
    },

    initialize: function(options) {
      this.list = options.list;
      this.schema = options.schema || this.list.schema;
      this.value = options.value;
      this.Editor = options.Editor || editors.Text;
      this.key = options.key;
    },

    render: function() {
      //Create editor
      this.editor = new this.Editor({
        key: this.key,
        schema: this.schema,
        value: this.value,
        list: this.list,
        item: this
      }).render();

      //Create main element
      var $el = $(Form.templates[this.schema.listItemTemplate]({
        editor: '<b class="bbf-tmp"></b>'
      }));

      $el.find('.bbf-tmp').replaceWith(this.editor.el);

      //Replace the entire element so there isn't a wrapper tag
      this.setElement($el);
        
      return this;
    },

    getValue: function() {
      return this.editor.getValue();
    },

    setValue: function(value) {
      this.editor.setValue(value);
    },
    
    focus: function() {
      this.editor.focus();
    },
    
    blur: function() {
      this.editor.blur();
    },

    remove: function() {
      this.editor.remove();

      Backbone.View.prototype.remove.call(this);
    },

    validate: function() {
      var value = this.getValue(),
          formValues = this.list.form ? this.list.form.getValue() : {},
          validators = this.schema.validators,
          getValidator = Form.helpers.getValidator;

      if (!validators) return null;

      //Run through validators until an error is found
      var error = null;
      _.every(validators, function(validator) {
        error = getValidator(validator)(value, formValues);

        return continueLoop = error ? false : true;
      });

      //Show/hide error
      error ? this.setError(error) : this.clearError();

      //Return error to be aggregated by list
      return error ? error : null;
    },

    /**
     * Show a validation error
     */
    setError: function(err) {
      if (_.isFunction(this.editor.setError)) {
        this.editor.setError(err);
      } else {
        this.$el.addClass(Form.classNames.error);
        this.$el.attr('title', err.message);
      }
    },

    /**
     * Hide validation errors
     */
    clearError: function() {
      if (_.isFunction(this.editor.setError)) {
        if (_.isFunction(this.editor.clearError)) {
          this.editor.clearError();
        }
      } else {
        this.$el.removeClass(Form.classNames.error);
        this.$el.attr('title', null);
      }
    }
  });


  /**
   * Modal object editor for use with the List editor.
   * To use it, set the 'itemType' property in a List schema to 'Object' or 'NestedModel'
   */
  editors.List.Modal = editors.List.Object = editors.List.NestedModel = editors.Base.extend({
    events: {
      'click': 'openEditor'
    },

    /**
     * @param {Object} options
     * @param {Function} [options.schema.itemToString]  Function to transform the value for display in the list.
     * @param {String} [options.schema.itemType]        Editor type e.g. 'Text', 'Object'.
     * @param {Object} [options.schema.subSchema]       Schema for nested form,. Required when itemType is 'Object'
     * @param {Function} [options.schema.model]         Model constructor function. Required when itemType is 'NestedModel'
     */
    initialize: function(options) {
      editors.Base.prototype.initialize.call(this, options);

      var schema = this.schema;
      
      //Dependencies
      if (!editors.List.Modal.ModalAdapter) throw 'A ModalAdapter is required';

      //Get nested schema if Object
      if (schema.itemType == 'Object') {
        if (!schema.subSchema) throw 'Missing required option "schema.subSchema"';

        this.nestedSchema = schema.subSchema;
      }

      //Get nested schema if NestedModel
      if (schema.itemType == 'NestedModel') {
        if (!schema.model) throw 'Missing required option "schema.model"';

        this.nestedSchema = schema.model.prototype.schema;
        if (_.isFunction(this.nestedSchema)) this.nestedSchema = this.nestedSchema();
      }
    },

    /**
     * Render the list item representation
     */
    render: function() {
      var self = this;

      //New items in the list are only rendered when the editor has been OK'd
      if (_.isEmpty(this.value)) {
        this.openEditor();
      }

      //But items with values are added automatically
      else {
        this.renderSummary();

        setTimeout(function() {
          self.trigger('readyToAdd');
        }, 0);
      }

      if (this.hasFocus) this.trigger('blur', this);

      return this;
    },

    /**
     * Renders the list item representation
     */
    renderSummary: function() {
      var template = Form.templates['list.Modal'];

      this.$el.html(template({
        summary: this.getStringValue()
      }));
    },

    /**
     * Function which returns a generic string representation of an object
     *
     * @param {Object} value
     * 
     * @return {String}
     */
    itemToString: function(value) {
      value = value || {};

      //Pretty print the object keys and values
      var parts = [];
      _.each(this.nestedSchema, function(schema, key) {
        var desc = schema.title ? schema.title : Form.helpers.keyToTitle(key),
            val = value[key];

        if (_.isUndefined(val) || _.isNull(val)) val = '';

        parts.push(desc + ': ' + val);
      });

      return parts.join('<br />');
    },

    /**
     * Returns the string representation of the object value
     */
    getStringValue: function() {
      var schema = this.schema,
          value = this.getValue();

      if (_.isEmpty(value)) return '[Empty]';

      //If there's a specified toString use that
      if (schema.itemToString) return schema.itemToString(value);
      
      //Otherwise check if it's NestedModel with it's own toString() method
      if (schema.itemType == 'NestedModel') {
        return new (schema.model)(value).toString();
      }
      
      //Otherwise use the generic method or custom overridden method
      return this.itemToString(value);
    },

    openEditor: function() {
      var self = this;

      var form = new Form({
        schema: this.nestedSchema,
        data: this.value
      });

      var modal = this.modal = new Backbone.BootstrapModal({
        content: form,
        animate: true
      }).open();

      this.trigger('open', this);
      this.trigger('focus', this);

      modal.on('cancel', function() {
        this.modal = null;

        this.trigger('close', this);
        this.trigger('blur', this);
      }, this);
      
      modal.on('ok', _.bind(this.onModalSubmitted, this, form, modal));
    },

    /**
     * Called when the user clicks 'OK'.
     * Runs validation and tells the list when ready to add the item
     */
    onModalSubmitted: function(form, modal) {
      var isNew = !this.value;

      //Stop if there are validation errors
      var error = form.validate();
      if (error) return modal.preventClose();
      this.modal = null;

      //If OK, render the list item
      this.value = form.getValue();

      this.renderSummary();

      if (isNew) this.trigger('readyToAdd');
      
      this.trigger('change', this);
      
      this.trigger('close', this);
      this.trigger('blur', this);
    },

    getValue: function() {
      return this.value;
    },

    setValue: function(value) {
      this.value = value;
    },
    
    focus: function() {
      if (this.hasFocus) return;

      this.openEditor();
    },
    
    blur: function() {
      if (!this.hasFocus) return;
      
      if (this.modal) {
        this.modal.trigger('cancel');
        this.modal.close();
      }
    }
  }, {
    //STATICS

    //The modal adapter that creates and manages the modal dialog.
    //Defaults to BootstrapModal (http://github.com/powmedia/backbone.bootstrap-modal)
    //Can be replaced with another adapter that implements the same interface.
    ModalAdapter: Backbone.BootstrapModal,
    
    //Make the wait list for the 'ready' event before adding the item to the list
    isAsync: true
  });

})();
