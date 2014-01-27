/**
 * Backbone Forms v{{version}}
 *
 * Copyright (c) 2013 Charles Davison, Pow Media Ltd
 *
 * License and more information at:
 * http://github.com/powmedia/backbone-forms
 */
(function(root, factory) {

  // Set up Backbone.Form appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['backbone', 'underscore', 'jquery', 'exports'], function(Backbone, _, $, exports) {
      exports = factory(root, _, Backbone, $);
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore'), Backbone = require('backbone'), $;
    try { $ = require('jquery'); } catch(e) {}
    module.exports = exports = factory(root, _, Backbone, $);

  // Finally, as a browser global.
  } else {
    root.Backbone.Form = factory(root, root._, root.Backbone, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(this, function(root, _, Backbone, $) {

  //SOURCE
  {{body}}

  //Metadata
  Form.VERSION = '{{version}}';

  return Form;
}));
