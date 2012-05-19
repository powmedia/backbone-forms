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

    nestedField: '\
      <div title="{{title}}">\
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
    ',

    date: '\
      <select data-type="date" style="width: 4em">{{dates}}</select>\
      <select data-type="month" style="width: {{monthWidth}}em">{{months}}</select>\
      <select data-type="year" style="width: 6em">{{years}}</select>\
    ',

    time: '\
      <div style="float: left; margin-right: 1em">{{date}}</div>\
      <select data-type="hour" style="width: 4em">{{hours}}</select>\
      :\
      <select data-type="min" style="width: 4em">{{mins}}</select>\
    ',
  };

  Backbone.Form.helpers.setTemplates(templates);
})();
