
//==================================================================================================
//BOOTSTRAP FORM
//==================================================================================================

Form.BootstrapForm = Form.extend({

  template: _.template('<form class="form-horizontal" data-fieldsets></form>'),

  initialize: function(options) {
    options.Fieldset = options.Fieldset || Form.BootstrapFieldset;
    options.Field = options.Field || Form.BootstrapField;
    options.NestedField = options.NestedField || Form.BootstrapNestedField;

    Form.prototype.initialize.call(this, options);
  }

});
