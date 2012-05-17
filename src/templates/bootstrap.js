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
      <ul class="unstyled clearfix">{{items}}</ul>\
      <button class="btn" style="margin-top: -10px" data-action="add">Add</div>\
    ',

    simpleListItem: '\
      <li class="clearfix" style="margin-bottom: 5px;">\
        <div class="pull-left">{{editor}}</div>\
        <button class="btn" style="margin-left: 4px" data-action="remove">x</button>\
      </li>\
    '
  };
  
  var classNames = {
    error: 'error'
  };

  Backbone.Form.helpers.setTemplates(templates, classNames);
})();
