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

    nestedField: '\
      <div title="{{title}}" class="input-xlarge">{{editor}}</div>\
      <div class="help-block">{{help}}</div>\
    ',

    list: '\
      <ul class="unstyled clearfix">{{items}}</ul>\
      <button class="btn" style="margin-top: -10px" data-action="add">Add</div>\
    ',

    listItem: '\
      <li class="clearfix" style="margin-bottom: 5px;">\
        <div class="pull-left">{{editor}}</div>\
        <button class="btn" style="margin-left: 4px" data-action="remove">x</button>\
      </li>\
    ',

    date: '\
      <select data-type="date" style="width: 4em">{{dates}}</select>\
      <select data-type="month" style="width: 9em">{{months}}</select>\
      <select data-type="year" style="width: 5em">{{years}}</select>\
    ',

    dateTime: '\
      <p>{{date}}</p>\
      <p>\
        <select data-type="hour" style="width: 4em">{{hours}}</select>\
        :\
        <select data-type="min" style="width: 4em">{{mins}}</select>\
      </p>\
    '
  };
  
  var classNames = {
    error: 'error'
  };

  Backbone.Form.helpers.setTemplates(templates, classNames);
})();
