
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

    simpleList: '\
      <ul class="bbf-simplelist-list"></ul>\
      <button class="bbf-simplelist-add">Add</div>\
    ',

    simpleListItem: '\
      <li>\
        <div class="bbf-simplelist-editor"></div>\
        <button class="bbf-simplelist-del">x</button>\
      </li>\
    ',
  };

  var defaultClassNames = {
    error: 'bbf-error'
  };
  