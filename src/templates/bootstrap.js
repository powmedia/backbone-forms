/**
 * Bootstrap templates for Backbone Forms
 *
 * Include this file after backbone-forms.js and the default templates will be overridden
 */
Backbone.Form.prototype.template = _.template($.trim('\
  <form class="form-horizontal" data-fieldsets></form>\
'));


Backbone.Form.Fieldset.prototype.template = _.template($.trim('\
  <fieldset data-fields>\
    <% if (legend) { %>\
      <legend><%= legend %></legend>\
    <% } %>\
  </fieldset>\
'));


Backbone.Form.Field.prototype.template = _.template($.trim('\
  <div class="control-group field-<%= key %>">\
    <label class="control-label" for="<%= editorId %>"><%= title %></label>\
    <div class="controls">\
      <span data-editor></span>\
      <div class="help-inline" data-error></div>\
      <div class="help-block"><%= help %></div>\
    </div>\
  </div>\
'));


Backbone.Form.NestedField.prototype.template = _.template($.trim('\
  <div class="field-<%= key %>">\
    <div title="<%= title %>" class="input-xlarge">\
      <span data-editor></span>\
      <div class="help-inline" data-error></div>\
    </div>\
    <div class="help-block"><%= help %></div>\
  </div>\
'));


Backbone.Form.editors.List.prototype.template = _.template($.trim('\
  <div class="bbf-list">\
    <ul class="unstyled clearfix" data-items></ul>\
    <button class="btn bbf-add" data-action="add">Add</button>\
  </div>\
'));


Backbone.Form.editors.List.Item.prototype.template = _.template($.trim('\
  <li class="clearfix">\
    <div class="pull-left" data-editor></div>\
    <button type="button" class="btn bbf-del" data-action="remove">&times;</button>\
  </li>\
'));
