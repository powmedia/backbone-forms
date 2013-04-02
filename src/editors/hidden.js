/**
 * Hidden editor
 */
Form.editors.Hidden = Form.editors.Base.extend({

  defaultValue: '',

  initialize: function(options) {
    Form.editors.Text.prototype.initialize.call(this, options);

    this.$el.attr('type', 'hidden');
  },

  focus: function() {

  },

  blur: function() {

  }

});
