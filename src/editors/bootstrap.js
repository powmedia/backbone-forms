;(function() {
  
  var Form = Backbone.Form,
      editors = Form.editors;

  Form.setTemplates({
    'bootstrap.ListObject': '\
      <div style="cursor: pointer; border: 1px solid #ccc; width: 208px; border-radius: 4px; padding: 2px 5px">\
        {{summary}}\
      </div>\
    '
  });

  /**
   * Modal object editor for use with the List editor.
   * To use it, set the 'listType' property in a List schema to 'bootstrap.ListObject'
   */
  editors['bootstrap.ListObject'] = editors.Base.extend({
    events: {
      'click': 'openEditor'
    },

    /**
     * @param {Object} options
     * @param {Form.editors.List} options.list    The list this editor appears in
     */
    initialize: function(options) {
      editors.Base.prototype.initialize.call(this, options);
      
      //Dependencies
      if (!Backbone.BootstrapModal) throw new Error('Backbone.BootstrapModal is required');

      //Required options
      if (!options.list) throw new Error('options.list is required');
      this.list = options.list;

      if (!options.item) throw new Error('options.item is required');
      this.item = options.item;
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
    objectToString: function(value) {
      value = value || {};

      //Pretty print the object keys and values
      var parts = [];
      _.each(this.schema.subSchema, function(schema, key) {
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
      
      /*
      //Otherwise check if it's NestedModel with it's own toString() method
      if (this.schema.listType == 'NestedModel') {
        var model = new (this.schema.model)(data);
      
        return model.toString();
      }
      */
      
      //Otherwise use the generic method or custom overridden method
      return this.objectToString(value);
    },

    openEditor: function() {
      var self = this;

      var form = new Form({
        schema: this.schema.subSchema,
        data: this.value
      });

      var modal = new Backbone.BootstrapModal({
        content: form,
        animate: true
      }).open();

      modal.on('ok', function() {
        var isNew = _.isEmpty(self.value);

        self.value = form.getValue();

        self.renderSummary();

        if (isNew) self.trigger('readyToAdd');
      });
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
