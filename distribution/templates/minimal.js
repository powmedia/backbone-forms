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
    ',

    simpleList: '\
      <ul>{{items}}</ul>\
      <button class="bbf-simplelist-add">Add</div>\
    ',

    simpleListItem: '\
      <li>\
        <div>{{editor}}</div>\
        <button class="bbf-simplelist-del">x</button>\
      </li>\
    '
  };

  Backbone.Form.helpers.setTemplates(templates);
})();
