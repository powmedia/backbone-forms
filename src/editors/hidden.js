/**
 * Hidden editor
 */
Form.editors.Hidden = Form.editors.Text.extend({

  defaultValue: '',

  noField: true,

  setElAttributes: function() {
    Form.editors.Text.prototype.setElAttributes.call(this);
    
    this.$el.prop('type', 'hidden');
  },

  focus: function() {

  },

  blur: function() {

  }

});
