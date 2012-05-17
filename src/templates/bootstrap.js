;(function() {
  var templates = {
    form: '\
      <form class="form-horizontal">{{fieldsets}}</form>\
    ',

    fieldset: '\
      <fieldset>\
        {{legend}}\
        {{fields}}\
      </fieldset>\
    ',

    field: '\
      <div class="control-group">\
        <label class="control-label" for="{{id}}">{{title}}</label>\
        <div class="controls">\
          <div class="input-xlarge">{{editor}}</div>\
          <div class="help-block">{{help}}</div>\
        </div>\
      </div>\
    ',

    simpleList: '\
      <ul class="unstyled bbf-simplelist-list"></ul>\
      <button class="btn bbf-simplelist-add">Add</div>\
    ',

    simpleListItem: '\
      <li>\
        <div class="pull-left bbf-simplelist-editor"></div>\
        <button class="btn pull-left bbf-simplelist-del">x</button>\
      </li>\
    '
  };
  
  var classNames = {
    error: 'error'
  };

  Backbone.Form.helpers.setTemplates(templates, classNames);
})();
