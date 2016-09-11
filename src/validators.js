
//==================================================================================================
//VALIDATORS
//==================================================================================================

Form.validators = (function() {

  var validators = {};

  validators.errMessages = {
    required: 'Required',
    regexp: 'Invalid',
    number: 'Must be a number',
    range: _.template('Must be a number between <%= min %> and <%= max %>', null, Form.templateSettings),
    email: 'Invalid email address',
    url: 'Invalid URL',
    match: _.template('Must match field "<%= field %>"', null, Form.templateSettings)
  };

  validators.required = function(options) {
    options = _.extend({
      type: 'required',
      message: this.errMessages.required
    }, options);

    return function required(value) {
      options.value = value;

      var err = {
        type: options.type,
        message: _.isFunction(options.message) ? options.message(options) : options.message
      },
      $ = Backbone.$;

      if (value === null || value === undefined || value === false || value === '' || $.trim(value) === '' ) return err;
    };
  };

  validators.regexp = function(options) {
    if (!options.regexp) throw new Error('Missing required "regexp" option for "regexp" validator');

    options = _.extend({
      type: 'regexp',
      match: true,
      message: this.errMessages.regexp
    }, options);

    return function regexp(value) {
      options.value = value;

      var err = {
        type: options.type,
        message: _.isFunction(options.message) ? options.message(options) : options.message
      };

      //Don't check empty values (add a 'required' validator for this)
      if (value === null || value === undefined || value === '') return;

      //Create RegExp from string if it's valid
      if ('string' === typeof options.regexp) options.regexp = new RegExp(options.regexp, options.flags);

      if ((options.match) ? !options.regexp.test(value) : options.regexp.test(value)) return err;
    };
  };

  validators.number = function(options) {
    options = _.extend({
      type: 'number',
      message: this.errMessages.number,
      regexp: /^[-+]?([0-9]*.[0-9]+|[0-9]+)$/
    }, options);

    return validators.regexp(options);
  };

  validators.range = function(options) {
    options = _.extend({
      type: 'range',
      message: this.errMessages.range,
      numberMessage: this.errMessages.number,
      min: 0,
      max: 100
    }, options);

    return function range(value) {
      options.value = value;
      var err = {
        type: options.type,
        message: _.isFunction(options.message) ? options.message(options) : options.message
      };

      //Don't check empty values (add a 'required' validator for this)
      if (value === null || value === undefined || value === '') return;

      // check value is a number
      var numberCheck = validators.number({message: options.numberMessage})(value);
      if (numberCheck) return numberCheck;

      // check value is in range
      var number = parseFloat(options.value);
      if (number < options.min || number > options.max) return err;
    }
  }

  validators.email = function(options) {
    options = _.extend({
      type: 'email',
      message: this.errMessages.email,
      regexp: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i
    }, options);

    return validators.regexp(options);
  };

  validators.url = function(options) {
    options = _.extend({
      type: 'url',
      message: this.errMessages.url,
      regexp: /^((http|https):\/\/)?(([A-Z0-9][A-Z0-9_\-]*)(\.[A-Z0-9][A-Z0-9_\-]*)+)(:(\d+))?\/?/i
    }, options);

    return validators.regexp(options);
  };

  validators.match = function(options) {
    if (!options.field) throw new Error('Missing required "field" options for "match" validator');

    options = _.extend({
      type: 'match',
      message: this.errMessages.match
    }, options);

    return function match(value, attrs) {
      options.value = value;

      var err = {
        type: options.type,
        message: _.isFunction(options.message) ? options.message(options) : options.message
      };

      //Don't check empty values (add a 'required' validator for this)
      if (value === null || value === undefined || value === '') return;

      if (value !== attrs[options.field]) return err;
    };
  };


  return validators;

})();
