;(function() {
  
  var Form = Backbone.Form,
      Base = Form.editors.Base,
      createTemplate = Form.helpers.createTemplate,
      triggerCancellableEvent = Form.helpers.triggerCancellableEvent,
      exports = {};
  
  /**
   * Additional editors that depend on jQuery UI
   */
  
  //DATE
  exports['jqueryui.Date'] = Base.extend({

    className: 'bbf-jui-date',
    
    initialize: function(options) {
      Base.prototype.initialize.call(this, options);
      
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
      var $el = this.$el;

      $el.html('<input>');

      var input = $('input', $el);

      input.datepicker({
        dateFormat: 'dd/mm/yy',
        showButtonPanel: true
      });
      
      this._observeDatepickerEvents();

      //Make sure setValue of this object is called, not of any objects extending it (e.g. DateTime)
      exports['jqueryui.Date'].prototype.setValue.call(this, this.value);

      return this;
    },

    /**
    * @return {Date}   Selected date
    */
    getValue: function() {
      var input = $('input', this.el),
          date = input.datepicker('getDate');

      return date;
    },
    
    setValue: function(value) {
      $('input', this.el).datepicker('setDate', value);
    },
    
    focus: function() {
      if (this.hasFocus) return;
      
      this.$('input').datepicker('show');
    },
    
    blur: function() {
      if (!this.hasFocus) return;
      
      this.$('input').datepicker('hide');
    },
    
    _observeDatepickerEvents: function() {
      var self = this;
      this.$('input').datepicker('option', 'onSelect', function() {
        self.trigger('change', self);
      })
      this.$('input').datepicker('option', 'onClose', function() {
        if (!self.hasFocus) return;
        self.trigger('blur', self);
      });
      this.$('input').datepicker('option', 'beforeShow', function() {
        if (self.hasFocus) return {};
        self.trigger('focus', self);
        
        return {};
      });
    }

  });


  //DATETIME
  exports['jqueryui.DateTime'] = exports['jqueryui.Date'].extend({

    className: 'bbf-jui-datetime',

    template: createTemplate('<select>{{hours}}</select> : <select>{{mins}}</select>'),

    render: function() {
      function pad(n) {
        return n < 10 ? '0' + n : n
      }

      //Render the date element first
      exports['jqueryui.Date'].prototype.render.call(this);

      //Setup hour options
      var hours = _.range(0, 24),
          hoursOptions = [];

      _.each(hours, function(hour) {
        hoursOptions.push('<option value="'+hour+'">' + pad(hour) + '</option>');
      });

      //Setup minute options
      var minsInterval = this.schema.minsInterval || 15,
          mins = _.range(0, 60, minsInterval),
          minsOptions = [];

      _.each(mins, function(min) {
        minsOptions.push('<option value="'+min+'">' + pad(min) + '</option>');
      });

      //Render time selects
      this.$el.append(this.template({
        hours: hoursOptions.join(),
        mins: minsOptions.join()
      }));
      
      this._observeDatepickerEvents();

      //Store references to selects
      this.$hours = $('select:eq(0)', this.el);
      this.$mins = $('select:eq(1)', this.el);
      
      //Set time
      this.setValue(this.value);

      return this;
    },

    /**
    * @return {Date}   Selected datetime
    */
    getValue: function() {
      var input = $('input', this.el),
          date = input.datepicker('getDate');

      date.setHours(this.$hours.val());
      date.setMinutes(this.$mins.val());
      date.setMilliseconds(0);

      return date;
    },
    
    setValue: function(date) {
      exports['jqueryui.Date'].prototype.setValue.call(this, date);
      
      this.$hours.val(date.getHours());
      this.$mins.val(date.getMinutes());
    }

  });


  //LIST
  exports['jqueryui.List'] = Base.extend({

    className: 'bbf-jui-list',

    //Note: The extra div around the <ul> is used to limit the drag area
    template: createTemplate('\
      <ul></ul>\
      <div><button class="bbf-list-add">Add</div>\
    '),

    itemTemplate: createTemplate('\
      <li rel="{{id}}">\
        <span class="bbf-list-text">{{text}}</span>\
        <div class="bbf-list-actions">\
          <button class="bbf-list-edit">Edit</button>\
          <button class="bbf-list-del">Delete</button>\
        </div>\
      </li>\
    '),
    
    editorTemplate: createTemplate('\
      <div class="bbf-field">\
          <div class="bbf-list-editor"></div>\
      </div>\
    '),

    events: {
      'click .bbf-list-add':   'addNewItem',
      'click .bbf-list-edit':  'editItem',
      'click .bbf-list-del':   'deleteItem'
    },

    initialize: function(options) {
      Base.prototype.initialize.call(this, options);

      if (!this.schema) throw "Missing required option 'schema'";
      
      this.schema.listType = this.schema.listType || 'Text';
      
      if (this.schema.listType == 'NestedModel' && !this.schema.model)
          throw "Missing required option 'schema.model'";
    },

    render: function() {
      var $el = this.$el;
      
      //Main element
      $el.html(this.template());
      
      //Create list
      var self = this,
          data = this.value || [],
          schema = this.schema,
          itemToString = this.itemToString,
          itemTemplate = this.itemTemplate,
          listEl = $('ul', $el);
      
      _.each(data, function(itemData) {     
        var text = itemToString.call(self, itemData);

        //Create DOM element
        var li = $(itemTemplate({
          id: itemData.id || '',
          text: text
        }));

        //Attach data
        $.data(li[0], 'data', itemData);

        listEl.append(li);
      });

      //Make sortable
      if (schema.sortable !== false) {
        listEl.sortable({
          axis: 'y',
          cursor: 'move',
          containment: 'parent'
        });
        
        $el.addClass('bbf-list-sortable');
      }

      //jQuery UI buttonize
      $('button.bbf-list-add', $el).button({
        text: false,
        icons: { primary: 'ui-icon-plus' }
      });
      $('button.bbf-list-edit', $el).button({
        text: false,
        icons: { primary: 'ui-icon-pencil' }
      });
      $('button.bbf-list-del', $el).button({
        text: false,
        icons: { primary: 'ui-icon-trash' }
      });
      
      if (this.hasFocus) this.trigger('blur', this);

      return this;
    },

    /**
     * Formats an item for display in the list
     * For example objects, dates etc. can have a custom
     * itemToString method which says how it should be formatted.
     */
    itemToString: function(data) {
      if (!data) return data;
      
      var schema = this.schema;
      
      //If there's a specified toString use that
      if (schema.itemToString) return schema.itemToString(data);
      
      //Otherwise check if it's NestedModel with it's own toString() method
      if (this.schema.listType == 'NestedModel') {
        var model = new (this.schema.model)(data);
      
        return model.toString();
      }
      
      //Last resort, just return the data as is
      return data;
    },

    /**
     * Add a new item to the list if it is completed in the editor
     */
    addNewItem: function(event) {
      if (event) event.preventDefault();
               
      var self = this;

      this.openEditor(null, function(value, editor) {
        //Fire 'addItem' cancellable event
        triggerCancellableEvent(self, 'addItem', [value, editor], function() {
          var text = self.itemToString(value);

          //Create DOM element
          var li = $(self.itemTemplate({
            id: value.id || '',
            text: text
          }));

          //Store data
          $.data(li[0], 'data', value);

          $('ul', self.el).append(li);

          //jQuery UI buttonize
          $('button.bbf-list-edit', this.el).button({
            text: false,
            icons: { primary: 'ui-icon-pencil' }
          });
          $('button.bbf-list-del', this.el).button({
            text: false,
            icons: { primary: 'ui-icon-trash' }
          });
          
          self.trigger('add', self, value);
          self.trigger('item:change', self, editor);
          self.trigger('change', self);
        });
      });
    },

    /**
     * Edit an existing item in the list
     */
    editItem: function(event) {
      event.preventDefault();
             
      var self = this,
          li = $(event.target).closest('li'),
          originalValue = $.data(li[0], 'data');

      this.openEditor(originalValue, function(newValue, editor) {
        //Fire 'editItem' cancellable event
        triggerCancellableEvent(self, 'editItem', [newValue, editor], function() {
          //Update display
          $('.bbf-list-text', li).html(self.itemToString(newValue));

          //Store data
          $.data(li[0], 'data', newValue);

          self.trigger('item:change', self, editor);
          self.trigger('change', self);
        });
      });
    },

    deleteItem: function(event) {
      event.preventDefault();
  
      var self = this,
          li = $(event.target).closest('li'),
          data = $.data(li[0], 'data');

      var confirmDelete = (this.schema.confirmDelete) ? this.schema.confirmDelete : false,
          confirmMsg = this.schema.confirmDeleteMsg || 'Are you sure?';
                  
      function remove() {
        triggerCancellableEvent(self, 'removeItem', [data], function() {
          li.remove();
          
          self.trigger('remove', self, data);
          self.trigger('change', self);
        });
      }
      
      if (this.schema.confirmDelete) {
        if (confirm(confirmMsg)) remove();
      } else {
        remove();
      }
    },

    /**
     * Opens the sub editor dialog
     * @param {Mixed}       Data (if editing existing list item, null otherwise)
     * @param {Function}    Save callback. receives: value
     */
    openEditor: function(data, callback) {
      var self = this,
          schema = this.schema,
          listType = schema.listType || 'Text';

      var editor = Form.helpers.createEditor(listType, {
        key: '',
        schema: schema,
        value: data
      }).render();
      
      var container = this.editorContainer = $(this.editorTemplate());
      $('.bbf-list-editor', container).html(editor.el);
      
      var saveAndClose = function() {        
        var errs = editor.validate();
        if (errs) return;
        
        callback(editor.getValue(), editor);
        container.dialog('close');
      }
      
      var handleEnterPressed = function(event) {
        if (event.keyCode != 13) return;
        
        saveAndClose();
      }

      $(container).dialog({
        resizable:  false,
        modal:      true,
        width:      500,
        title:      data ? 'Edit item' : 'New item',
        buttons: {
          'OK': saveAndClose, 
          'Cancel': function() {
            container.dialog('close');
          }
        },
        close: function() {
          self.editorContainer = null;
          
          $(document).unbind('keydown', handleEnterPressed);

          editor.remove();
          container.remove();
          
          self.trigger('item:close', self, editor);
          self.trigger('item:blur', self, editor);
          self.trigger('blur', self);
        }
      });
      
      this.trigger('item:open', this, editor);
      this.trigger('item:focus', this, editor);
      this.trigger('focus', this);

      //Save and close dialog on Enter keypress
      $(document).bind('keydown', handleEnterPressed);
    },

    getValue: function() {
      var data = [];

      $('li', this.el).each(function(index, li) {
        data.push($.data(li, 'data'));
      });

      return data;
    },
    
    setValue: function(value) {
      this.value = value;
      this.render();
    },
    
    focus: function() {
      if (this.hasFocus) return;
      
      var item = this.$('li .bbf-list-edit').first();
      if (item.length > 0) {
        item.click();
      }
      else {
        this.addNewItem();
      }
    },
    
    blur: function() {
      if (!this.hasFocus) return;
      
      if (this.editorContainer) this.editorContainer.dialog('close');
    }

  });


  //Exports
  _.extend(Form.editors, exports);
  
})();
