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

  setElAttributes: function() {
    Form.editors.Base.prototype.setElAttributes.call(this);
  }, 

  readonlyTemplate: _.template('<textarea readonly></textarea>', null, Form.templateSettings)

});
