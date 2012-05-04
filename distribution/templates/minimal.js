;(function() {
  var templates = {
    form: '\
      <form>{{fieldsets}}</form>\
    ',

    fieldset: '\
      <fieldset>\
        {{legend}}\
        {{fields}}\
      </fieldset>\
    ',

    field: '\
      <div>\
        <label for="{{id}}">{{title}}</label>\
        <div>{{editor}}</div>\
        <div>{{help}}</div>\
      </div>\
    '
  };

  Backbone.Form.helpers.setTemplates(templates);
})();
