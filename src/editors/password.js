/**
 * Password editor
 */
Form.editors.Password = Form.editors.Text.extend({

  initialize: function(options) {
    Form.editors.Text.prototype.initialize.call(this, options);

    this.$el.attr('type', 'password');
  }

});
