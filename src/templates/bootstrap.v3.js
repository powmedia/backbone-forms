/** 
 * Include this template file after backbone-forms.amd.js to override the default templates
 * 
 * 'data-*' attributes control where elements are placed
 */
;(function(Form) {

  
  /**
   * Bootstrap templates for Backbone Forms
   */
  Form.template = _.template('\
    <form role="form" data-fieldsets></form>\
  ');

  Form.Fieldset.template = _.template('\
    <fieldset data-fields>\
      <% if (legend) { %>\
        <legend><%= legend %></legend>\
      <% } %>\
    </fieldset>\
  ');


  Form.Field.template = _.template('\
    <div class="form-group field-<%= key %>">\
      <label for="<%= editorId %>"><%= title %></label>\
      <div data-editor></div>\
      <div class="help-inline" data-error></div>\
      <div class="help-block"><%= help %></div>\
    </div>\
  ');

  Form.editors.Date.template = _.template('\
    <div class="bbf-date">\
      <select class="form-control" data-type="date"><%= dates %></select>\
      <select class="form-control" data-type="month"><%= months %></select>\
      <select class="form-control" data-type="year"><%= years %></select>\
    </div>\
  ');

  Form.editors.DateTime.template = _.template('\
    <div class="bbf-datetime">\
      <div class="bbf-date-container" data-date></div>\
      <select data-type="hour" class="form-control"><%= hours %></select>\
      :\
      <select data-type="min" class="form-control"><%= mins %></select>\
    </div>\
  ');

  Form.NestedField.template = _.template('\
    <div class="form-group field-<%= key %>">\
      <label class="control-label" for="<%= editorId %>"><%= title %></label>\
      <div title="<%= title %>">\
        <span data-editor></span>\
        <div class="help-inline" data-error></div>\
      </div>\
      <div class="help-block"><%= help %></div>\
    </div>\
  ');

  Form.Editor.baseClassName = 'form-control';

  if (Form.editors.List) {

    Form.editors.List.template = _.template('\
      <div class="bbf-list">\
        <ul class="list-unstyled" data-items></ul>\
        <button type="button" class="btn bbf-add" data-action="add">Add</button>\
      </div>\
    ');


    Form.editors.List.Item.template = _.template('\
      <li class="input-group">\
        <span data-editor></span>\
        <span class="btn bbf-del input-group-addon" data-action="remove">&times;</span>\
      </li>\
    ');
    

    Form.editors.List.Object.template = Form.editors.List.NestedModel.template = _.template('\
      <div class="bbf-list-modal"><%= summary %></div>\
    ');

  }


})(Backbone.Form);
