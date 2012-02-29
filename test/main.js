// Author: Thomas Davis <thomasalwyndavis@gmail.com>
// Filename: main.js

// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.
require.config({
    paths:{
        Backbone:        'lib/backbone-0.9.1-amd',
        Forms:           '../src/backbone-forms',
        'jquery-ui':     'lib/jquery-ui/jquery-ui-1.8.14.custom.min',
        'jquery-editors':'../src/jquery-ui-editors',
        underscore:      'lib/underscore-1.3.1-amd'
    }

});

//require([
//  // Load our app module and pass it to our definition function
//  'app'
//
//  // Some plugins have to be loaded in order due to their non AMD compliance
//  // Because these scripts are not "modules" they do not pass any values to the definition function below
//], function(App){
//  // The "app" dependency is passed in as "App"
//  // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
//  App.initialize({app:App});
//});
require(['jquery', 'Forms', 'jquery-editors'], function ($, Backbone) {
    console.log('here')
    function validateEmail(str) {
        var regex = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");

        return regex.test(str) ? null : 'Invalid email';
    }

    var Model = Backbone.Model.extend({
        schema:{
            email:     { dataType:'email', validators:['required', validateEmail] },
            tel:       { type:'Text', dataType:'tel', validators:['required'] },
            number:    { type:'Number', validators:[/[0-9]+(?:\.[0-9]*)?/] },
            checkbox:  { type:'Checkbox' },
            date:      { type:'Date', help:'Some help text' },
            datetime:  { type:'DateTime' },
            list:      { type:'List' },
            radio:     { type:'Radio', options:['Opt 1', 'Opt 2'] },
            checkboxes:{ type:'Checkboxes', options:['Sterling', 'Lana', 'Cyril', 'Cheryl', 'Pam']
            }
        }
    });

    var model = new Model({
        number:  null,
        checkbox:true,
        list:    ['item1', 'item2', 'item3']
    });

    var form = new Backbone.Form({
        model:    model,
        fieldsets:[
            ['email', 'tel', 'number', 'checkbox', 'radio', 'checkboxes'],
            { legend:'jQuery UI editors', fields:['date', 'datetime', 'list'] }
        ]
    }).render();

   // window.form = form;

    $('#uiTest').html(form.el);
});