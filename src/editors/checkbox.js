/**
 * Checkbox editor
 *
 * Creates a single checkbox, i.e. boolean value
 */
Form.editors.Checkbox = Form.editors.Base.extend({

  defaultValue: false,

  tagName: 'input',

  events: {
    'click':  function(event) {
      this.trigger('change', this);
    },
    'focus':  function(event) {
      this.trigger('focus', this);
    },
    'blur':   function(event) {
      this.trigger('blur', this);
    }
  },

  setElAttributes: function() {
    Form.editors.Base.prototype.setElAttributes.call(this);
    this.$el.prop('type', 'checkbox');
  },

  /**
   * Adds the editor to the DOM
   */
  render: function() {
    Form.editors.Base.prototype.render.call(this);
    this.setValue(this.value);
    return this;
  },

  getValue: function() {
    return this.$el.prop('checked');
  },

  setValue: function(value) {
    if (value) {
      this.$el.prop('checked', true);
    }else{
      this.$el.prop('checked', false);
    }
    this.value = !!value;
  },

  focus: function() {
    if (this.hasFocus) return;

    this.$el.focus();
  },

  blur: function() {
    if (!this.hasFocus) return;

    this.$el.blur();
  },

  readonlyTemplate: _.template('<input disabled></input>', null, Form.templateSettings)

});
