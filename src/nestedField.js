
//==================================================================================================
//NESTEDFIELD
//==================================================================================================

Form.NestedField = Form.Field.extend({}, {

  template: _.template('\
    <div>\
      <label for="<%= editorId %>">\
        <% if (titleHTML){ %><%= titleHTML %>\
        <% } else { %><%- title %><% } %>\
      </label>\
      <div>\
        <span data-editor></span>\
        <div class="error-text" data-error></div>\
        <div class="error-help"><%= help %></div>\
      </div>\
    </div>\
  ', null, Form.templateSettings)

});
