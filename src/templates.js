
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
      <select style="width: 4em">{{dates}}</select>\
      <select style="width: 4em">{{months}}</select>\
      <select style="width: 6em">{{years}}</select>\
    ',

    time: '\
      <select style="width: 4em">{{hours}}</select>\
      :\
      <select style="width: 4em">{{mins}}</select>\
    ',
  };

  var defaultClassNames = {
    error: 'bbf-error'
  };
  