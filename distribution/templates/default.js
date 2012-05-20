;(function() {
  var templates = {
    form: '\
      <form class="bbf-form">{{fieldsets}}</form>\
    ',
    
    fieldset: '\
      <fieldset>\
        <legend>{{legend}}</legend>\
        <ul>{{fields}}</ul>\
      </fieldset>\
    ',
    
    field: '\
      <li class="bbf-field bbf-field{{type}}">\
        <label for="{{id}}">{{title}}</label>\
        <div class="bbf-editor bbf-editor{{type}}">{{editor}}</div>\
        <div class="bbf-help">{{help}}</div>\
      </li>\
    ',

    nestedField: '\
      <li class="bbf-narrow-field bbf-field{{type}}" title="{{title}}">\
        <label for="{{id}}">{{title}}</label>\
        <div class="bbf-editor bbf-editor{{type}}">{{editor}}</div>\
        <div class="bbf-help">{{help}}</div>\
      </li>\
    ',

    list: '\
      <ul>{{items}}</ul>\
      <div class="bbf-actions"><button data-action="add">Add</div>\
    ',

    listItem: '\
      <li>\
        <button data-action="remove" class="bbf-remove" >x</button>\
        <div class="bbf-editor-container">{{editor}}</div>\
      </li>\
    ',

    date: '\
      <select data-type="date" class="bbf-date">{{dates}}</select>\
      <select data-type="month" class="bbf-month">{{months}}</select>\
      <select data-type="year" class="bbf-year">{{years}}</select>\
    ',

    dateTime: '\
      <div class="bbf-date-container">{{date}}</div>\
      <select data-type="hour" class="bbf-hour">{{hours}}</select>\
      :\
      <select data-type="min" class="bbf-min">{{mins}}</select>\
    '
  };
  
  var classNames = {
    error: 'bbf-error'
  };

  Backbone.Form.helpers.setTemplates(templates, classNames);
})();
