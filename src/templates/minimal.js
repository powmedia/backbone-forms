;(function() {
  var templates = {
    form: '\
      <form>{{fieldsets}}</form>\
    ',

    fieldset: '\
      <fieldset>\
        <legend>{{legend}}</legend>\
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

    nestedField: '\
      <div title="{{title}}">\
        <div>{{editor}}</div>\
        <div>{{help}}</div>\
      </div>\
    ',

    list: '\
      <ul>{{items}}</ul>\
      <div><button data-action="add">Add</div>\
    ',

    listItem: '\
      <li>\
        <button data-action="remove">x</button>\
        <div>{{editor}}</div>\
      </li>\
    ',

    date: '\
      <select data-type="date">{{dates}}</select>\
      <select data-type="month">{{months}}</select>\
      <select data-type="year">{{years}}</select>\
    ',

    dateTime: '\
      <div>{{date}}</div>\
      <select data-type="hour">{{hours}}</select>\
      :\
      <select data-type="min">{{mins}}</select>\
    '
  };

  Backbone.Form.helpers.setTemplates(templates);
})();
