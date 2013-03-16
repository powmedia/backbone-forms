
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
    Form.prototype.initialize.call(this, options);

    this.Fieldset = options.Fieldset || Backbone.BootstrapForm.Fieldset;
    this.Field = options.Field || Backbone.BootstrapForm.Field;
  }

});
