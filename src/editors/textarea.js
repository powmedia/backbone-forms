/**
 * TextArea editor
 */
Form.editors.TextArea = Form.editors.Text.extend({

  tagName: 'textarea',

  /**
   * Override Text constructor so type property isn't set (issue #261)
   */
  initialize: function(options) {
    Form.editors.Base.prototype.initialize.call(this, options);
  },

  getValue: function () {
    return this.$el.html();
  },

  setValue: function (value) {
    this.$el.html(value);
  },

  determineChange: function (event) {
    var currentValue = this.$el.html();
    var changed = (currentValue !== this.previousValue);

    if (changed) {
      this.previousValue = currentValue;
      this.trigger('change', this);
    }
  }

});
