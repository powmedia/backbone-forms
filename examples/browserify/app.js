//Initial app setup
var Backbone = require('backbone'),
    jQuery = require('jquery'),
    Form = require('../..');

//You must set Backbone.$ with the library you want to use; e.g. jQuery
Backbone.$ = jQuery;


//Now you can use forms
var form = new Form({
  schema: {
    email: 'Text',
    password: 'Password'
  }
});

jQuery('body').append(form.render().el);
