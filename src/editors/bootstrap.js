;(function() {
  
  var Form = Backbone.Form,
      editors = Form.editors;

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
     */
    initialize: function(options) {
      editors.Base.prototype.initialize.call(this, options);
      
      //Dependencies
      if (!Backbone.BootstrapModal) throw new Error('Backbone.BootstrapModal is required');

      this.objectEditor = new editors.Object(options);
    },

    /**
     * Render the list item representation
     */
    render: function() {
      this.$el.append(this.getStringValue());

      return this;
    },

    /**
     * Function which returns a generic string representation of an object
     *
     * @param {Object} value
     * 
     * @return {String}
     */
    objectToString: function(value) {
      return 'test';//_.keys(value);
    },

    /**
     * Returns the string representation of the object value
     */
    getStringValue: function() {
      var schema = this.schema,
          value = this.getValue();

      //Prevent null/undefineds being converted to string
      if (!value) return '';

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
      var modal = new Backbone.BootstrapModal({
        content: this.objectEditor
      }).open();

      return this;
    },

    getValue: function() {
      return this.objectEditor.getValue();
    },

    setValue: function(value) {
      return this.objectEditor.setValue(value);
    }
  });

})();
