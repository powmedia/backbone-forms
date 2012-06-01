/**
 * Backbone Forms v{{version}}
 *
 * Copyright (c) 2012 Charles Davison, Pow Media Ltd
 *
 * License and more information at:
 * http://github.com/powmedia/backbone-forms
 */
;(function() {

  //DEPENDENCIES
  //Global object (window in the browser)
  var root = this;

  var $, _, Backbone;

  //CommonJS
  if (typeof require !== 'undefined') {
    $ = require('jquery');
    _ = require('underscore');
    Backbone = require('backbone');
  }

  //Browser
  else {
    $ = root.jQuery;
    _ = root._;
    Backbone = root.Backbone;
  }


  //SOURCE
  {{body}}


  //EXPORTS
  //CommonJS
  if (typeof module == 'object' && module.exports) {
    module.exports = Form;
  }

  //Browser
  else {
    Backbone.Form = Form;
  }

}).call(this);
