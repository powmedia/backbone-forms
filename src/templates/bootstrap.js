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
        <label for="{{id}}" class="control-label">{{title}}</label>\
        <div class="controls">\
          <div class="input-xlarge">{{editor}}</div>\
        </div>\
      </div>\
    '
  };

  Backbone.Form.helpers.setTemplates(templates);
})();
