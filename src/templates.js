
//==================================================================================================
//TEMPLATES
//==================================================================================================

  var defaultTemplates = {
    form: '\
      <form class="bbf-form">{{fieldsets}}</form>\
    ',
    
    fieldset: '\
      <fieldset>\
        {{legend}}\
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
      <ul class="bbf-list">{{items}}</ul>\
      <div class="bbf-list-actions"><button data-action="add">Add</div>\
    ',

    listItem: '\
      <li class="bbf-listitem">\
        <button data-action="remove" class="bbf-listitem-remove" >x</button>\
        <div class="bbf-listitem-editor">{{editor}}</div>\
      </li>\
    ',

    date: '\
      <select data-type="date" class="bbf-date-date">{{dates}}</select>\
      <select data-type="month" class="bbf-date-month">{{months}}</select>\
      <select data-type="year" class="bbf-date-year">{{years}}</select>\
    ',

    dateTime: '\
      <div class="bbf-datetime-date">{{date}}</div>\
      <select data-type="hour" class="bbf-datetime-hour">{{hours}}</select>\
      :\
      <select data-type="min" class="bbf-datetime-min">{{mins}}</select>\
    ',
  };

  var defaultClassNames = {
    error: 'bbf-error'
  };
  