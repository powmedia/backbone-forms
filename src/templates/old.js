/**
 * Templates to match those used previous versions of Backbone Form, i.e. <= 0.11.0
 *
 * Include this file after backbone-forms.js and the default templates will be overridden
 */
Backbone.Form.prototype.template = _.template($.trim('\
  <form class="bbf-form" data-fieldsets></form>\
'));


Backbone.Form.Fieldset.prototype.template = _.template($.trim('\
  <fieldset>\
    <% if (legend) { %>\
      <legend><%= legend %></legend>\
    <% } %>\
    <ul data-fields></ul>\
  </fieldset>\
'));


Backbone.Form.Field.prototype.template = _.template($.trim('\
  <li class="bbf-field field-<%= key %>">\
    <label for="<%= editorId %>"><%= title %></label>\
    <div class="bbf-editor" data-editor></div>\
    <div class="bbf-help"><%= help %></div>\
    <div class="bbf-error" data-error></div>\
  </li>\
'));


Backbone.Form.NestedField.prototype.template = _.template($.trim('\
  <li class="bbf-field bbf-nested-field field-<%= key %>">\
    <label for="<%= editorId %>"><%= title %></label>\
    <div class="bbf-editor" data-editor></div>\
    <div class="bbf-help"><%= help %></div>\
    <div class="bbf-error" data-error></div>\
  </li>\
'));


Backbone.Form.editors.Date.prototype.template = _.template($.trim('\
  <div class="bbf-date">\
    <select class="bbf-date" data-type="date"><%= dates %></select>\
    <select class="bbf-month" data-type="month"><%= months %></select>\
    <select class="bbf-year" data-type="year"><%= years %></select>\
  </div>\
'));


Backbone.Form.editors.DateTime.prototype.template = _.template($.trim('\
  <div class="bbf-datetime">\
    <div class="bbf-date-container" data-date></div>\
    <select data-type="hour"><%= hours %></select>\
    :\
    <select data-type="min"><%= mins %></select>\
  </div>\
'));


Backbone.Form.editors.List.prototype.template = _.template($.trim('\
  <div class="bbf-list">\
    <ul data-items></ul>\
    <div class="bbf-actions"><button type="button" data-action="add">Add</div>\
  </div>\
'));


Backbone.Form.editors.List.Item.prototype.template = _.template($.trim('\
  <li>\
    <button type="button" data-action="remove" class="bbf-remove">&times;</button>\
    <div class="bbf-editor-container" data-editor></div>\
  </li>\
'));


Backbone.Form.editors.List.Modal.prototype.template = _.template($.trim('\
  <div class="bbf-list-modal">\
    <%= summary %>\
  </div>\
'));
