/**
 * NestedModel editor
 *
 * Creates a child form. For editing nested Backbone models
 *
 * Special options:
 *   schema.model:   Embedded model constructor
 */
Form.editors.NestedModel = Form.editors.Object.extend({
  initialize: function(options) {
    Form.editors.Base.prototype.initialize.call(this, options);

    if (!this.form) throw new Error('Missing required option "form"');
  },

  render: function() {
    //Get the constructor for creating the nested form; i.e. the same constructor as used by the parent form
    var NestedForm = this.form.constructor;

    var data = this.value || {},
        key = this.key;

    // TODO: This works for me as my nested models are never null but what about Backbone.Relational or other implementations?
    //Wrap the data in a model if it isn't already a model instance
    if (!(data instanceof Backbone.Model)) {
      if (!this.schema.model) throw new Error('Missing required "schema.model" option for NestedModel editor');
      data = new this.schema.model(data)
    }

    this.nestedForm = new NestedForm({
      model: data,
      idPrefix: this.id + '_',
      fieldTemplate: 'nestedField'
    });

    this._observeFormEvents();

    //Render form
    this.$el.html(this.nestedForm.render().el);

    if (this.hasFocus) this.trigger('blur', this);

    return this;
  },

  /**
   * Update the embedded model, checking for nested validation errors and pass them up
   * Then update the main model if all OK
   *
   * @return {Error|null} Validation error or null
   */
  commit: function() {
    var error = this.nestedForm.commit();
    if (error) {
      this.$el.addClass('error');
      return error;
    }

    return Form.editors.Object.prototype.commit.call(this);
  },

  getValue: function() {
    if (this.nestedForm) {
      // Return the value in the same way you got it
      if (this.value instanceof Backbone.Model) this.nestedForm.commit();
      else return this.nestedForm.getValue();
    }

    return this.value;
  }
});
