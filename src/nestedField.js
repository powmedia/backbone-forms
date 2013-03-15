
//==================================================================================================
//NESTEDFIELD
//==================================================================================================

Form.NestedField = Form.Field.extend({

  template: _.template('\
    <div class="field-<%= key %>">\
      <div title="<%= title %>" class="input-xlarge">\
        <div data-editor></div>\
        <div class="help-inline" data-error></div>\
      </div>\
      <div class="help-block"><%= help %></div>\
    </div>\
  ')

});
