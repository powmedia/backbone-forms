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
      var isFirstItem = (this.list.items.length == 1 && this.list.items[0] == this.item) ? true : false

      //Render if an empty list
      if (isFirstItem && _.isEmpty(this.value)) {
        this.$el.html('[Click to edit]');
        return this;
      }

      //Otherwise show item summary
      this.$el.html(this.getStringValue());

      //Open editor if item has just been added
      if (_.isEmpty(this.value)) {
        this.openEditor();
      }

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
        content: form
      }).open();

      modal.on('ok', function() {
        self.value = form.getValue();
        self.render();
      });

      modal.on('cancel', function() {
        self.list.removeItem(self.item);
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

    //Don't display empty objects in the list
    displayEmpty: false
  });

})();
