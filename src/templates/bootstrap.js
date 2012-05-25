;(function() {
  var templates = {
    form: '\
      <form class="form-horizontal">{{fieldsets}}</form>\
    ',

    fieldset: '\
      <fieldset>\
        <legend>{{legend}}</legend>\
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

    nestedField: '\
      <div title="{{title}}" class="input-xlarge">{{editor}}</div>\
      <div class="help-block">{{help}}</div>\
    ',

    list: '\
      <ul class="unstyled clearfix">{{items}}</ul>\
      <button class="btn bbf-add" data-action="add">Add</div>\
    ',

    listItem: '\
      <li class="clearfix">\
        <div class="pull-left">{{editor}}</div>\
        <button class="btn bbf-del" data-action="remove">x</button>\
      </li>\
    ',

    date: '\
      <select class="bbf-date" data-type="date">{{dates}}</select>\
      <select class="bbf-month" data-type="month">{{months}}</select>\
      <select class="bbf-year" data-type="year">{{years}}</select>\
    ',

    dateTime: '\
      <p>{{date}}</p>\
      <p>\
        <select data-type="hour" style="width: 4em">{{hours}}</select>\
        :\
        <select data-type="min" style="width: 4em">{{mins}}</select>\
      </p>\
    ',

    'list.Modal': '\
      <div class="bbf-list-modal">\
        {{summary}}\
      </div>\
    '
  };
  
  var classNames = {
    error: 'error'
  };

  Backbone.Form.helpers.setTemplates(templates, classNames);
})();
