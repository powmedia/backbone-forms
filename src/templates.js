
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

    simpleList: '\
      <ul>{{items}}</ul>\
      <div class="bbf-actions"><button data-action="add">Add</div>\
    ',

    simpleListItem: '\
      <li>\
        <button class="bbf-remove" data-action="remove">x</button>\
        <div class="bbf-editor-container">{{editor}}</div>\
      </li>\
    ',

    date: '\
      <select data-type="date" style="width: 4em">{{dates}}</select>\
      <select data-type="month" style="width: {{monthWidth}}em">{{months}}</select>\
      <select data-type="year" style="width: 6em">{{years}}</select>\
    ',

    time: '\
      &nbsp;\
      <select data-type="hour" style="width: 4em">{{hours}}</select>\
      :\
      <select data-type="min" style="width: 4em">{{mins}}</select>\
    ',
  };

  var defaultClassNames = {
    error: 'bbf-error'
  };
  