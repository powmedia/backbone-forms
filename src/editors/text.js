/**
 * Text
 * 
 * Text input with focus, blur and change events
 */
Form.editors.Text = Form.Editor.extend({

  tagName: 'input',

  defaultValue: '',

  previousValue: '',

  events: {
    'keyup':    'determineChange',
    'keypress': function(event) {
      var self = this;
      setTimeout(function() {
        self.determineChange();
      }, 0);
    },
    'select':   function(event) {
      this.trigger('select', this);
    },
    'focus':    function(event) {
      this.trigger('focus', this);
    },
    'blur':     function(event) {
      this.trigger('blur', this);
    }
  },

  setElAttributes: function() {
    Form.editors.Base.prototype.setElAttributes.call(this);

    //Allow customising text type (email, phone etc.) for HTML5 browsers
    var type = 'text';

    if (this.schema && this.schema.editorAttrs && this.schema.editorAttrs.type) type = this.schema.editorAttrs.type;
    if (this.schema && this.schema.dataType) type = this.schema.dataType;

    this.$el.prop('type', type);
  },

  /**
   * Adds the editor to the DOM
   */
  render: function() {
    Form.editors.Base.prototype.render.call(this);
    this.setValue(this.value);
    return this;
  },

  determineChange: function(event) {
    var currentValue = this.$el.val();
    var changed = (currentValue !== this.previousValue);

    if (changed) {
      this.previousValue = currentValue;

      this.trigger('change', this);
    }
  },

  /**
   * Returns the current editor value
   * @return {String}
   */
  getValue: function() {
    return this.$el.val();
  },

  /**
   * Sets the value of the form element
   * @param {String}
   */
  setValue: function(value) {
    this.$el.val(value);
  },

  focus: function() {
    if (this.hasFocus) return;

    this.$el.focus();
  },

  blur: function() {
    if (!this.hasFocus) return;

    this.$el.blur();
  },

  select: function() {
    this.$el.select();
  },

  readonlyTemplate: _.template('<input readonly></input>', null, Form.templateSettings)

});
