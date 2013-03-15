
//==================================================================================================
//FIELD
//==================================================================================================

Form.Field = Backbone.View.extend({

  template: _.template('\
    <div class="control-group field-<%= key %>">\
      <label class="control-label" for="<%= editorId %>"><%= title %></label>\
      <div class="controls">\
        <div data-editor></div>\
        <div class="help-inline" data-error></div>\
        <div class="help-block"><%= help %></div>\
      </div>\
    </div>\
  '),

  /**
   * CSS class name added to the field when there is a validation error
   */
  errorClassName: 'error',

  initialize: function(options) {
    options = options || {};

    //Store important data
    _.extend(this, _.pick(options, 'form', 'key', 'value', 'model', 'idPrefix'));

    //Override defaults
    _.extend(this, _.pick(options, 'template', 'errorClassName'));

    //Create the full field schema, merging defaults etc.
    this.schema = this.createSchema(options.schema);

    //Create editor
    this.editor = this.createEditor();
  },

  /**
   * Creates the full field schema, merging defaults etc.
   *
   * @param {Object|String} schema
   *
   * @return {Object}
   */
  createSchema: function(schema) {
    if (_.isString(schema)) schema = { type: schema };

    return _.extend({
      type: 'Text',
      title: this.createTitle()
    }, schema);
  },

  /**
   * Creates the editor specified in the schema; either a string name or
   * a constructor function
   *
   * @return {View}
   */
  createEditor: function() {
    var options = _.extend(
      _.pick(this, 'schema', 'form', 'key', 'idPrefix', 'model', 'value'),
      { id: this.createEditorId() }
    );

    var type = this.schema.type,
        constructorFn = (_.isString(type)) ? Form.editors[type] : type;

    return new constructorFn(options);
  },

  /**
   * Creates the ID that will be assigned to the editor
   *
   * @return {String}
   */
  createEditorId: function() {
    var prefix = this.idPrefix,
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
   * Create the default field title (label text) from the key name.
   * (Converts 'camelCase' to 'Camel Case')
   *
   * @return {String}
   */
  createTitle: function() {
    var str = this.key;

    //Add spaces
    str = str.replace(/([A-Z])/g, ' $1');

    //Uppercase first character
    str = str.replace(/^./, function(str) { return str.toUpperCase(); });

    return str;
  },

  /**
   * Returns the data to be passed to the template
   *
   * @return {Object}
   */
  templateData: function() {
    return _.extend({
      help: '',
      key: this.key,
      editorId: this.editor.id
    }, this.schema);
  },

  render: function() {
    var schema = this.schema;

    //Render field
    var $field = $(this.template(_.result(this, 'templateData')));

    if (schema.fieldClass) $field.addClass(schema.fieldClass);
    if (schema.fieldAttrs) $field.attr(schema.fieldAttrs);

    //Render editor
    $field.find('[data-editor]').html(this.editor.render().el);

    this.setElement($field);

    return this;
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
    //Nested form editors (e.g. Object) set their errors internally
    if (this.editor.hasNestedForm) return;

    //Add error CSS class
    this.$el.addClass(this.errorClassName);

    //Set error message
    this.$('[data-error]').html(msg);
  },

  /**
   * Clear the error state and reset the help message
   */
  clearError: function() {
    //Remove error CSS class
    this.$el.removeClass(this.errorClassName);

    //Clear error message
    this.$('[data-error]').empty();
  },

  /**
   * Update the model with the new value from the editor
   *
   * @return {Mixed}
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

  /**
   * Give the editor focus
   */
  focus: function() {
    this.editor.focus();
  },

  /**
   * Remove focus from the editor
   */
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
