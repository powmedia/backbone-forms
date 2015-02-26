/**
 * Password editor
 */
Form.editors.Password = Form.editors.Text.extend({

  setElAttributes: function() {
    Form.editors.Text.prototype.setElAttributes.call(this);

    this.$el.prop('type', 'password');
  }

});
