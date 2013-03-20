
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



//==================================================================================================
//BOOTSTRAP FIELDSET
//==================================================================================================

Form.BootstrapFieldset = Form.Fieldset.extend({

  template: _.template('\
    <fieldset data-fields>\
      <% if (legend) { %>\
        <legend><%= legend %></legend>\
      <% } %>\
    </fieldset>\
  ')

});




//==================================================================================================
//BOOTSTRAP FIELD
//==================================================================================================

Form.BootstrapField = Form.Field.extend({

  template: _.template('\
    <div class="control-group field-<%= key %>">\
      <label class="control-label" for="<%= editorId %>"><%= title %></label>\
      <div class="controls">\
        <span data-editor></span>\
        <div class="help-inline" data-error></div>\
        <div class="help-block"><%= help %></div>\
      </div>\
    </div>\
  ')

});




//==================================================================================================
//BOOTSTRAP NESTED FIELD
//==================================================================================================

Form.BootstrapNestedField = Form.Field.extend({

  template: _.template('\
    <div class="field-<%= key %>">\
      <div title="<%= title %>" class="input-xlarge">\
        <span data-editor></span>\
        <div class="help-inline" data-error></div>\
      </div>\
      <div class="help-block"><%= help %></div>\
    </div>\
  ')

});

