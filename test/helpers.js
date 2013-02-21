;(function(Form, Field, editors) {



module('keyToTitle');

test('Transforms camelCased string to words', function() {
    var fn = Form.helpers.keyToTitle;
    
    equal(fn('test'), 'Test');
    equal(fn('camelCasedString'), 'Camel Cased String');
});



;(function() {
  
  module('createTemplate', {
      setup: function() {
        this._compileTemplate = Form.helpers.compileTemplate;
      },

      teardown: function() {
        Form.setTemplateCompiler(this._compileTemplate);
      }
  });
  
  var createTemplate = Form.helpers.createTemplate;

  test('returns a compiled template if just passed a string', function() {
    var template = createTemplate('Hello {{firstName}} {{lastName}}.');
    
    var result = template({ firstName: 'John', lastName: 'Smith' });
    
    equal(result, 'Hello John Smith.');
  });

  test('returns a template compiled with a different templating program, when just passed a string - e.g. Handlebars', function() {
    Form.setTemplateCompiler(Handlebars.compile);

    var template = createTemplate('Hello {{#with person}}{{firstName}} {{lastName}}{{/with}}.');

    var result = template({ person: { firstName: 'John', lastName: 'Smith' } });

    equal(result, 'Hello John Smith.');
  });

  test('works when underscore template settings are different and restores them when done', function() {
    var originalSetting = /\[\[(.+?)\]\]/g;
    _.templateSettings.interpolate = originalSetting;
    
    var template = createTemplate('Bye {{firstName}} {{lastName}}!');
    
    var result = template({ firstName: 'John', lastName: 'Smith' });
    
    equal(result, 'Bye John Smith!');
    
    equal(_.templateSettings.interpolate, originalSetting);
  });

  test('returns the supplanted string if a context is passed', function() {
    var result = createTemplate('Hello {{firstName}} {{lastName}}.', {
      firstName: 'John',
      lastName: 'Smith'
    });
    
    equal(result, 'Hello John Smith.');
  });
  
})();



;(function() {

  module('setTemplates', {
    setup: function() {
      this._templates = Form.templates;
      this._classNames = _.clone(Form.classNames);
      this._createTemplate = Form.helpers.createTemplate;
    },
    
    teardown: function() {
      Form.templates = this._templates;
      Form.classNames = this._classNames;
      Form.helpers.createTemplate = this._createTemplate;
    }
  });
  
  var setTemplates = Form.helpers.setTemplates;
  
  test('Compiles strings into templates', function() {
    var self = this;
    
    var templates = {
      form: '<form class="customForm">{{fieldsets}}</form>'
    }
    
    var calledCreateTemplate = false,
        calledWith = null;
    Form.helpers.createTemplate = function(str) {
      calledCreateTemplate = true;
      calledWith = arguments;
      
      return self._createTemplate(str);
    }
    
    setTemplates(templates);
    
    ok(calledCreateTemplate, 'Should call createTemplate');
    equal(calledWith[0], templates.form);
  });
  
  test('Takes already compiled templates', function() {
    var templates = {
      customField: Form.helpers.createTemplate('<div class="customField">{{label}} {{editor}} {{help}}</div>')
    }
    
    setTemplates(templates);
    
    equal(Form.templates.customField, templates.customField);
  });
  
  test('Sets custom templates', function() {
    var templates = {
      customField: Form.helpers.createTemplate('<field class="customField">{{editor}}</div>')
    }

    setTemplates(templates);

    equal(Form.templates.customField, templates.customField);
  });
  
  test('Sets class names', function() {
    var classNames = {
      error: 'customError'
    };
    
    setTemplates(null, classNames);
    
    equal(Form.classNames.error, 'customError');
  });
  
  test('Can be called via Form.setTemplates shortcut', function() {
    same(Form.setTemplates, Form.helpers.setTemplates);
  });
  
})();



module('createEditor');

(function() {
    
    var create = Form.helpers.createEditor,
        editors = Form.editors;

    var options = {
        key: 'test',
        schema: {
            subSchema: {
                key: 'test'
            },
            model: 'test',
            options: []
        }
    };    
    
    test('Accepts strings for included editors', function() {
        ok(create('Text', options) instanceof editors.Text);
        ok(create('Number', options) instanceof editors.Number);
        ok(create('TextArea', options) instanceof editors.TextArea);
        ok(create('Password', options) instanceof editors.Password);
        ok(create('Select', options) instanceof editors.Select);
        ok(create('Object', options) instanceof editors.Object);
        ok(create('NestedModel', options) instanceof editors.NestedModel);
    });

    test('Accepts editor constructors', function() {
        ok(create(editors.Text, options) instanceof editors.Text);
        ok(create(editors.Select, options) instanceof editors.Select);
    });
    
})();



(function() {
  
  module('getValidator');
  
  var getValidator = Form.helpers.getValidator;

  test('Given a string, a bundled validator is returned', function() {
    var required = getValidator('required'),
        email = getValidator('email');
    
    equal(required(null).type, 'required');
    equal(email('invalid').type, 'email');
  });
  
  test('Given a string, throws if the bundled validator is not found', function() {
    expect(1);
    
    try {
      getValidator('unknown validator');
    } catch (e) {
      equal(e.message, 'Validator "unknown validator" not found');
    }
  });
  
  test('Given an object, a customised bundled validator is returned', function() {
    //Can customise error message
    var required = getValidator({ type: 'required', message: 'Custom message' });
    
    var err = required('');
    equal(err.type, 'required');
    equal(err.message, 'Custom message');
    
    //Can customise options on certain validators
    var regexp = getValidator({ type: 'regexp', regexp: /foobar/, message: 'Must include "foobar"' });
    
    var err = regexp('invalid');
    equal(err.type, 'regexp');
    equal(err.message, 'Must include "foobar"');
  });

  test('Given a regular expression, returns a regexp validator', function() {
    var regexp = getValidator(/hello/);
    
    equal(regexp('invalid').type, 'regexp');
  });

  test('Given a function, it is returned', function () {
    var myValidator = function () { return; };

    var validator = getValidator(myValidator);

    equal(validator, myValidator);
  });

  test('Given an unknown type, an error is thrown', function () {
    expect(1);
    
    try {
      getValidator(['array']);
    } catch (e) {
      equal(e.message, 'Invalid validator: array');
    }
  });

})();



})(Backbone.Form, Backbone.Form.Field, Backbone.Form.editors);
