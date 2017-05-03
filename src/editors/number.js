/**
 * NUMBER
 *
 * Normal text input that only allows a number. Letters etc. are not entered.
 */
Form.editors.Number = Form.editors.Text.extend({

  defaultValue: 0,

  events: _.extend({}, Form.editors.Text.prototype.events, {
    'input':    'determineChange'
  }),

  initialize: function(options) {
    Form.editors.Text.prototype.initialize.call(this, options);

    var schema = this.schema;

    this.$el.attr('type', 'number');

    if (!schema || !schema.editorAttrs || !schema.editorAttrs.step) {
      // provide a default for `step` attr,
      // but don't overwrite if already specified
      this.$el.attr('step', 'any');
    }
  },

  getValue: function() {
    var value = this.$el.val();

    return value === "" ? null : parseFloat(value, 10);
  },

  setValue: function(value) {
    value = (function() {
      if (_.isNumber(value)) return value;

      if (_.isString(value) && value !== '') return parseFloat(value, 10);

      return null;
    })();

    if (_.isNaN(value)) value = null;
    this.value = value;
    Form.editors.Text.prototype.setValue.call(this, value);
  }

});
