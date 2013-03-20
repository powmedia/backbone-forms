/**
 * Object editor
 *
 * Creates a child form. For editing Javascript objects
 *
 * @param {Object} options
 * @param {Object} options.schema             The schema for the object
 * @param {Object} options.schema.subSchema   The schema for the nested form
 */
Form.editors.Object = Form.editors.Base.extend({
  //Prevent error classes being set on the main control; they are internally on the individual fields
  hasNestedForm: true,

  className: 'bbf-object',

  initialize: function(options) {
    //Set default value for the instance so it's not a shared object
    this.value = {};

    //Init
    Form.editors.Base.prototype.initialize.call(this, options);

    //Check required options
    if (!this.schema.subSchema) throw new Error("Missing required 'schema.subSchema' option for Object editor");
  },

  render: function() {
    //Create the nested form
    this.form = new Form({
      schema: this.schema.subSchema,
      data: this.value,
      idPrefix: this.id + '_',
      Field: Form.NestedField
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
