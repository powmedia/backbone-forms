/**
 * Backbone Forms v{{version}}
 *
 * Copyright (c) 2012 Charles Davison, Pow Media Ltd
 *
 * License and more information at:
 * http://github.com/powmedia/backbone-forms
 */
;(function($, _, Backbone) {

  {{body}}

  //EXPORTS
  //Add to the Backbone namespace if available, for use via <script> tags
  Backbone.Form = Backbone.Form || Form;

  //AMD (RequireJS) - For exporting as a module when Backbone and jQuery are on the page
  //If using RequireJS to load Backbone, Underscore and jQuery, use the AMD-specific file
  if (typeof define === 'function' && define.amd) {
    return define(function() {
      return Form;
    });
  }

  //CommonJS (NodeJS)
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = Form;
    return;
  }

}(jQuery, _, Backbone));
