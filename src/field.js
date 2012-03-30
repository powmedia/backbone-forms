
  //==================================================================================================
  //FIELD
  //==================================================================================================
  
  var Field = Backbone.View.extend({

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
      this.form = options.form;
      this.key = options.key;
      this.value = options.value;
      this.model = options.model;

      //Get schema
      var schema = this.schema = (function() {
        //Handle schema type shorthand where the editor name is passed instead of a schema config object
        if (_.isString(options.schema)) return { type: options.schema };

        return options.schema || {};
      })();
      
      //Set schema defaults
      if (!schema.type) schema.type = 'Text';
      if (!schema.title) schema.title = helpers.keyToTitle(this.key);
      if (!schema.template) schema.template = 'field';
    },

    render: function() {
      var schema = this.schema,
          templates = Form.templates;

      //Standard options that will go to all editors
      var options = {
        form: this.form,
        key: this.key,
        schema: schema,
        idPrefix: this.options.idPrefix,
        id: this.getId()
      };

      //Decide on data delivery type to pass to editors
      if (this.model)
        options.model = this.model;
      else
        options.value = this.value;

      //Decide on the editor to use
      var editor = this.editor = helpers.createEditor(schema.type, options);
      
      //Create the element
      var $field = $(templates[schema.template]({
        key: this.key,
        title: schema.title,
        id: editor.id,
        type: schema.type,
        editor: '<span class="bbf-placeholder-editor"></span>',
        help: '<span class="bbf-placeholder-help"></span>'
      }));
      
      //Render editor
      var $editorContainer = $('.bbf-placeholder-editor', $field)
      $editorContainer.append(editor.render().el);
      $editorContainer.children().unwrap();

      //Set help text
      this.$help = $('.bbf-placeholder-help', $field).parent();
      this.$help.empty();
      if (this.schema.help) this.$help.html(this.schema.help);
      
      //Add custom CSS class names
      if (this.schema.fieldClass) $field.addClass(this.schema.fieldClass);
      
      //Add custom attributes
      if (this.schema.fieldAttrs) $field.attr(this.schema.fieldAttrs);
      
      this.setElement($field);

      return this;
    },

    /**
     * Creates the ID that will be assigned to the editor
     *
     * @return {String}
     *
     * @api private
     */
    getId: function() {
      var prefix = this.options.idPrefix,
          id = this.key;

      //Replace periods with underscores (e.g. for when using paths)
      //id = id.replace(new RegExp('\\.', 'g'), '_');
      id = id.replace(/\./g, '_');

      //If a specific ID prefix is set, use it
      if (_.isString(prefix) || _.isNumber(prefix)) return prefix + id;
      if (_.isNull(prefix)) return id;

      //Otherwise, if there is a model use it's CID to avoid conflicts when multiple forms are on the page
      if (this.model) return this.model.cid + '_' + id;

      return id;
    },
    
    /**
     * Check the validity of the field
     * @return {String}
     */
    validate: function() {
      var error = this.editor.validate();

      if (error) {
        this.setError(error.message);
      } else {
        this.clearError();
      }

      return error;
    },
    
    /**
     * Set the field into an error state, adding the error class and setting the error message
     *
     * @param {String} errMsg
     */
    setError: function(errMsg) {
      //Object and NestedModel types set their own errors internally
      if (this.editor.hasNestedForm) return;
      
      var errClass = Form.classNames.error;

      this.$el.addClass(errClass);
      
      if (this.$help) this.$help.html(errMsg);
    },
    
    /**
     * Clear the error state and reset the help message
     */
    clearError: function() {
      var errClass = Form.classNames.error;
       
      this.$el.removeClass(errClass);
      
      // some fields (e.g., Hidden), may not have a help el
      if (this.$help) {
        this.$help.empty();
      
        //Reset help text if available
        var helpMsg = this.schema.help;
        if (helpMsg) this.$help.html(helpMsg);
      }
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
      if (!console || !console.log) return;
      
      console.log(this.getValue());
    },

    remove: function() {
      this.editor.remove();

      Backbone.View.prototype.remove.call(this);
    }

  });
