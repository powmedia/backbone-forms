
//==================================================================================================
//FIELD
//==================================================================================================

Form.Field = (function() {

  var helpers = Form.helpers,
      templates = Form.templates;

  return Backbone.View.extend({

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
    /**
     * Creates a new field
     * 
     * @param {Object} options
     * @param {Object} [options.schema]     Field schema. Defaults to { type: 'Text' }
     * @param {Model} [options.model]       Model the field relates to. Required if options.data is not set.
     * @param {String} [options.key]        Model key/attribute the field relates to.
     * @param {Mixed} [options.value]       Field value. Required if options.model is not set.
     * @param {String} [options.idPrefix]   Prefix for the editor ID. By default, the model's CID is used.
     *
     * @return {Field}
     */
    initialize: function(options) {
      options = options || {};

      this.form = options.form;
      this.key = options.key;
      this.value = options.value;
      this.model = options.model;

      //Turn schema shorthand notation (e.g. 'Text') into schema object
      if (_.isString(options.schema)) options.schema = { type: options.schema };
      
      //Set schema defaults
      this.schema = _.extend({
        type: 'Text',
        title: helpers.keyToTitle(this.key),
        template: 'field'
      }, options.schema);
    },


    /**
     * Provides the context for rendering the field
     * Override this to extend the default context
     *
     * @param {Object} schema
     * @param {View} editor
     *
     * @return {Object}     Locals passed to the template
     */
    renderingContext: function(schema, editor) {
      return {
        key: this.key,
        title: schema.title,
        id: editor.id,
        type: schema.type,
        editor: '<b class="bbf-tmp-editor"></b>',
        help: '<b class="bbf-tmp-help"></b>',
        error: '<b class="bbf-tmp-error"></b>'
      };
    },


    /**
     * Renders the field
     */
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
      if (this.model) {
        options.model = this.model;
      } else {
        options.value = this.value;
      }

      //Decide on the editor to use
      var editor = this.editor = helpers.createEditor(schema.type, options);
      
      //Create the element
      var $field = $(templates[schema.template](this.renderingContext(schema, editor)));

      //Remove <label> if it's not wanted
      if (schema.title === false) {
        $field.find('label[for="'+editor.id+'"]').first().remove();
      }
      
      //Render editor
      $field.find('.bbf-tmp-editor').replaceWith(editor.render().el);

      //Set help text
      this.$help = $('.bbf-tmp-help', $field).parent();
      this.$help.empty();
      if (this.schema.help) this.$help.html(this.schema.help);

      //Create error container
      this.$error = $($('.bbf-tmp-error', $field).parent()[0]);
      if (this.$error) this.$error.empty();

      //Add custom CSS class names
      if (this.schema.fieldClass) $field.addClass(this.schema.fieldClass);
      
      //Add custom attributes
      if (this.schema.fieldAttrs) $field.attr(this.schema.fieldAttrs);
      
      //Replace the generated wrapper tag
      this.setElement($field);

      return this;
    },

    /**
     * Creates the ID that will be assigned to the editor
     *
     * @return {String}
     */
    getId: function() {
      var prefix = this.options.idPrefix,
          id = this.key;

      //Replace periods with underscores (e.g. for when using paths)
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
     *
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
     * @param {String} msg     Error message
     */
    setError: function(msg) {
      //Object and NestedModel types set their own errors internally
      if (this.editor.hasNestedForm) return;
      
      var errClass = Form.classNames.error;

      this.$el.addClass(errClass);
      
      if (this.$error) {
        this.$error.html(msg);
      } else if (this.$help) {
        this.$help.html(msg);
      }
    },
    
    /**
     * Clear the error state and reset the help message
     */
    clearError: function() {
      var errClass = Form.classNames.error;
       
      this.$el.removeClass(errClass);
      
      // some fields (e.g., Hidden), may not have a help el
      if (this.$error) {
        this.$error.empty();
      } else if (this.$help) {
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
     *
     * @return {Mixed}
     */
    getValue: function() {
      return this.editor.getValue();
    },
    
    /**
     * Set/change the value of the editor
     *
     * @param {Mixed} value
     */
    setValue: function(value) {
      this.editor.setValue(value);
    },
    
    focus: function() {
      this.editor.focus();
    },
    
    blur: function() {
      this.editor.blur();
    },

    /**
     * Remove the field and editor views
     */
    remove: function() {
      this.editor.remove();

      Backbone.View.prototype.remove.call(this);
    }

  });

})();
