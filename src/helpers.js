
//==================================================================================================
//HELPERS
//==================================================================================================

Form.helpers = (function() {

  var helpers = {};

  /**
   * Gets a nested attribute using a path e.g. 'user.name'
   *
   * @param {Object} obj    Object to fetch attribute from
   * @param {String} path   Attribute path e.g. 'user.name'
   * @return {Mixed}
   * @api private
   */
  helpers.getNested = function(obj, path) {
    var fields = path.split(".");
    var result = obj;
    for (var i = 0, n = fields.length; i < n; i++) {
      result = result[fields[i]];
    }
    return result;
  };
  
  /**
   * This function is used to transform the key from a schema into the title used in a label.
   * (If a specific title is provided it will be used instead).
   * 
   * By default this converts a camelCase string into words, i.e. Camel Case
   * If you have a different naming convention for schema keys, replace this function.
   * 
   * @param {String}  Key
   * @return {String} Title
   */
  helpers.keyToTitle = function(str) {
    //Add spaces
    str = str.replace(/([A-Z])/g, ' $1');

    //Uppercase first character
    str = str.replace(/^./, function(str) { return str.toUpperCase(); });

    return str;
  };

  /**
   * Helper to compile a template with the {{mustache}} style tags. Template settings are reset
   * to user's settings when done to avoid conflicts.
   * @param {String}    Template string
   * @return {Template} Compiled template
   */
  helpers.compileTemplate = function(str) {
      //Store user's template options
      var _interpolateBackup = _.templateSettings.interpolate;

      //Set custom template settings
      _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;

      var template = _.template(str);

      //Reset to users' template settings
      _.templateSettings.interpolate = _interpolateBackup;

      return template;
  };

  /**
   * Helper to create a template with the {{mustache}} style tags.
   * If context is passed in, the template will be evaluated.
   * @param {String}             Template string
   * @param {Object}             Optional; values to replace in template
   * @return {Template|String}   Compiled template or the evaluated string
   */
  helpers.createTemplate = function(str, context) {
    var template = helpers.compileTemplate(str);
    
    if (!context) {
      return template;
    } else {
      return template(context);
    }
  };
  

  /**
   * Sets the template compiler to the given function
   * @param {Function} Template compiler function
   */
  helpers.setTemplateCompiler = function(compiler) {
    helpers.compileTemplate = compiler;
  };
  
  
  /**
   * Sets the templates to be used.
   * 
   * If the templates passed in are strings, they will be compiled, expecting Mustache style tags,
   * i.e. <div>{{varName}}</div>
   *
   * You can also pass in previously compiled Underscore templates, in which case you can use any style
   * tags.
   * 
   * @param {Object} templates
   * @param {Object} classNames
   */
  helpers.setTemplates = function(templates, classNames) {
    var createTemplate = helpers.createTemplate;
    
    Form.templates = Form.templates || {};
    Form.classNames = Form.classNames || {};
    
    //Set templates, compiling them if necessary
    _.each(templates, function(template, key, index) {
      if (_.isString(template)) template = createTemplate(template);
      
      Form.templates[key] = template;
    });
    
    //Set class names
    _.extend(Form.classNames, classNames);
  };
  
  
  /**
   * Return the editor constructor for a given schema 'type'.
   * Accepts strings for the default editors, or the reference to the constructor function
   * for custom editors
   * 
   * @param {String|Function} The schema type e.g. 'Text', 'Select', or the editor constructor e.g. editors.Date
   * @param {Object}          Options to pass to editor, including required 'key', 'schema'
   * @return {Mixed}          An instance of the mapped editor
   */
  helpers.createEditor = function(schemaType, options) {
    var constructorFn;

    if (_.isString(schemaType)) {
      constructorFn = Form.editors[schemaType];
    } else {
      constructorFn = schemaType;
    }

    return new constructorFn(options);
  };
  
  /**
   * Triggers an event that can be cancelled. Requires the user to invoke a callback. If false
   * is passed to the callback, the action does not run.
   *
   * NOTE: This helper uses private Backbone apis so can break when Backbone is upgraded
   * 
   * @param {Mixed}       Instance of Backbone model, view, collection to trigger event on
   * @param {String}      Event name
   * @param {Array}       Arguments to pass to the event handlers
   * @param {Function}    Callback to run after the event handler has run.
   *                      If any of them passed false or error, this callback won't run
   */ 
  helpers.triggerCancellableEvent = function(subject, event, args, callback) { 
    //Return if there are no event listeners
    if (!subject._callbacks || !subject._callbacks[event]) return callback();
    
    var next = subject._callbacks[event].next;
    if (!next) return callback();
    
    var fn = next.callback,
        context = next.context || this;
    
    //Add the callback that will be used when done
    args.push(callback);
    
    fn.apply(context, args);
  };
  
  /**
   * Returns a validation function based on the type defined in the schema
   *
   * @param {RegExp|String|Function} validator
   * @return {Function}
   */
  helpers.getValidator = function(validator) {
    var validators = Form.validators;

    //Convert regular expressions to validators
    if (_.isRegExp(validator)) {
      return validators.regexp({ regexp: validator });
    }
    
    //Use a built-in validator if given a string
    if (_.isString(validator)) {
      if (!validators[validator]) throw new Error('Validator "'+validator+'" not found');
      
      return validators[validator]();
    }

    //Functions can be used directly
    if (_.isFunction(validator)) return validator;

    //Use a customised built-in validator if given an object
    if (_.isObject(validator) && validator.type) {
      var config = validator;
      
      return validators[config.type](config);
    }
    
    //Unkown validator type
    throw new Error('Invalid validator: ' + validator);
  };


  return helpers;

})();
