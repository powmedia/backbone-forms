
//==================================================================================================
//BOOTSTRAP FORM
//==================================================================================================

Backbone.BootstrapForm = Form.extend({

  template: _.template('\
    <form class="form-horizontal">\
      <div data-fieldsets></div>\
    </form>\
  '),

  initialize: function(options) {
    options.Fieldset = options.Fieldset || Form.BootstrapFieldset;
    options.Field = options.Field || Form.BootstrapField;

    Form.prototype.initialize.call(this, options);
  }

});
