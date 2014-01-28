/**
 * Backbone Forms v{{version}}
 *
 * Copyright (c) 2014 Charles Davison, Pow Media Ltd
 *
 * License and more information at:
 * http://github.com/powmedia/backbone-forms
 */
(function(root, factory) {

  // Set up Backbone.Form appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'backbone', 'exports'], function(_, Backbone, exports) {
      exports = factory(root, _, Backbone, Backbone.$);
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore'), Backbone = require('backbone');
    module.exports = exports = factory(root, _, Backbone, Backbone.$);

  // Finally, as a browser global.
  } else {
    root.Backbone.Form = factory(root, root._, root.Backbone, root.Backbone.$);
  }

}(this, function(root, _, Backbone, $) {

  //SOURCE
  {{body}}

  //Metadata
  Form.VERSION = '{{version}}';

  return Form;
}));
