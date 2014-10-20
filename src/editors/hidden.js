/**
 * Hidden editor
 */
Form.editors.Hidden = Form.editors.Text.extend({

  defaultValue: '',

  isHidden: true,

  initialize: function(options) {
    Form.editors.Text.prototype.initialize.call(this, options);

    this.$el.attr('type', 'hidden');
  },

  focus: function() {

  },

  blur: function() {

  }

});
