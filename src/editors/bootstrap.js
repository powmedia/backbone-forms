;(function() {
  
  var Form = Backbone.Form,
      editors = Form.editors;

  Form.setTemplates({
    'bootstrap.ListObject': '\
      <div style="cursor: pointer; border: 1px solid #ccc; width: 208px; border-radius: 3px; padding: 4px; color: #555">\
        {{summary}}\
      </div>\
    '
  });

  /**
   * Modal object editor for use with the List editor.
   * To use it, set the 'itemType' property in a List schema to 'bootstrap.ListObject'
   */
  editors['bootstrap.ListObject'] = editors['bootstrap.ListNestedModel'] = editors.Base.extend({
    events: {
      'click': 'openEditor'
    },

    /**
     * @param {Object} options
     * @param {String} [options.schema.itemType]    Item editor type: 'List.Object' | 'List.NestedModel'
     * @param {Object} [options.schema.subSchema]   Schema for nested form,. Required when itemType is 'Object'
     * @param {Function} [options.schema.model]     Model constructor function. Required when itemType is 'NestedModel'
     */
    initialize: function(options) {
      editors.Base.prototype.initialize.call(this, options);
      
      //Dependencies
      if (!Backbone.BootstrapModal) throw new Error('Backbone.BootstrapModal is required');

      //Get nested schema if Object
      if (this.schema.itemType == 'bootstrap.ListObject') {
        if (!this.schema.subSchema) throw 'Missing required option "schema.subSchema"';

        this.nestedSchema = this.schema.subSchema;
      }

      //Get nested schema if NestedModel
      if (this.schema.itemType == 'bootstrap.ListNestedModel') {
        if (!this.schema.model) throw 'Missing required option "schema.model"';

        this.nestedSchema = this.schema.model.prototype.schema;
        if (_.isFunction(this.nestedSchema)) this.nestedSchema = this.nestedSchema();
      }
    },

    /**
     * Render the list item representation
     */
    render: function() {
      //Actual rendering only takes place once the dialog has been OK'd
      this.openEditor();

      return this;
    },

    /**
     * Renders the list item representation
     */
    renderSummary: function() {
      var template = Form.templates['bootstrap.ListObject'];

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
      if (schema.itemType == 'bootstrap.ListNestedModel') {
        console.log('hi')
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

      var modal = new Backbone.BootstrapModal({
        content: form,
        animate: true
      }).open();

      modal.on('ok', _.bind(this.onModalSubmitted, this, form, modal));
    },

    /**
     * Called when the user clicks 'OK'.
     * Runs validation and tells the list when ready to add the item
     */
    onModalSubmitted: function(form, modal) {
      var isNew = _.isEmpty(this.value);

      //Stop if there are validation errors
      var error = form.validate();
      if (error) return modal.preventClose();

      //If OK, render the list item
      this.value = form.getValue();

      this.renderSummary();

      if (isNew) this.trigger('readyToAdd');
    },

    getValue: function() {
      return this.value;
    },

    setValue: function(value) {
      this.value = value;
    }
  }, {
    //STATICS
    
    //Make the wait list for the 'ready' event before adding the item to the list
    isAsync: true
  });

})();
