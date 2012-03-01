// Author: Thomas Davis <thomasalwyndavis@gmail.com>
// Filename: main.js

// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.
require.config({
    paths:{
        Backbone:        'lib/backbone-0.9.1-amd',
        'Backbone.Form':           '../src/backbone-forms',
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
