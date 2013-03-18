
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
