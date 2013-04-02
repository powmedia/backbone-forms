;(function(Form, Editor) {

var same = deepEqual;


module('Editor#initialize');

test('sets the value if using options.model', function() {
  var model = new Backbone.Model({
    name: 'John'
  });

  var editor = new Editor({
    model: model,
    key: 'name'
  });

  same(editor.value, 'John');
});

test('uses options.value if options.model not specified', function() {
  var editor = new Editor({
    value: 'Hello'
  });

  same(editor.value, 'Hello');
});

test('sets to defaultValue if options.model and options.value are not set', function() {
  var editor = new Editor();

  same(editor.value, null);
});

test('stores important data', function() {
  var form = new Form(),
      schema = { type: 'Text', validators: ['required'] };

  var editor = new Editor({
    form: form,
    key: 'name',
    schema: schema
  });

  same(editor.key, 'name');
  same(editor.form, form);
  same(editor.schema, schema);
});

test('stores validators from options or schema', function() {
  var editor = new Editor({
    validators: ['required']
  });

  same(editor.validators, ['required']);

  var editor2 = new Editor({
    schema: { validators: ['email'] }
  });

  same(editor2.validators, ['email']);
});

test('sets the "id" attribute on the element', function() {
  var editor = new Editor({
    id: 'foo'
  });

  same(editor.$el.attr('id'), 'foo');
});

test('sets the "name" attribute on the element, if key is available', function() {
  var editor = new Editor({
    key: 'title'
  });

  same(editor.$el.attr('name'), 'title');
});

test('options.schema.editorClass - Adds class names to editor', function() {
  var editor = new Editor({
    schema: { editorClass: 'foo bar' }
  });

  var $el = editor.$el;

  ok($el.hasClass('foo'), 'Adds first defined class');
  ok($el.hasClass('bar'), 'Adds other defined class');
});

test('options.schema.editorAttrs option - Adds custom attributes', function() {
  var editor = new Editor({
    schema: {
      editorAttrs: {
        maxlength: 30,
        type: 'foo',
        custom: 'hello'
      }
    }
  });

  var $el = editor.$el;

  same($el.attr('maxlength'), '30');
  same($el.attr('type'), 'foo');
  same($el.attr('custom'), 'hello');
});



module('Editor#getName');

test('replaces periods with underscores', function() {
  var editor = new Editor({
    key: 'user.name.first'
  });

  same(editor.getName(), 'user_name_first');
});



module('Editor#getValue');

test('returns editor value', function() {
  var editor = new Editor({
    value: 'foo'
  });

  same(editor.getValue(), 'foo');
});



module('Editor#setValue');

test('sets editor value', function() {
  var editor = new Editor({
    value: 'foo'
  });

  editor.setValue('bar');

  same(editor.value, 'bar');
});



module('Editor#commit', {
  setup: function() {
    var self = this;

    this.sinon = sinon.sandbox.create();

    this.validationErr = null;
    this.sinon.stub(Editor.prototype, 'validate', function() {
      return self.validationErr;
    });
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('returns validation errors', function() {
  var editor = new Editor();

  this.validationErr = { type: 'required' };

  same(editor.commit(), this.validationErr);
});

test('returns model validation errors if options.validate is true', function() {
  var model = new Backbone.Model();

  model.validate = function() {
    return 'ERROR';
  };

  var editor = new Editor({
    model: model,
    key: 'title'
  });

  same(editor.commit({ validate: true }), 'ERROR');
});

test('sets value to model', function() {
  var model = new Backbone.Model();

  var editor = new Editor({
    model: model,
    key: 'title'
  });

  editor.setValue('New Title');

  editor.commit();

  same(model.get('title'), 'New Title');
});



module('Editor#validate');

test('returns validation errors', function() {
  var editor = new Editor({
    validators: ['required']
  });

  var err = editor.validate();

  same(err.type, 'required');
  same(err.message, 'Required');
});

test('returns undefined if no errors', function() {
  var editor = new Editor({
    validators: ['required'],
    value: 'ok'
  });

  var err = editor.validate();

  same(err, undefined);
});



module('Editor#trigger');

test('sets hasFocus to true on focus event', function() {
  var editor = new Editor();

  editor.hasFocus = false;

  editor.trigger('focus');

  same(editor.hasFocus, true);
});

test('sets hasFocus to false on blur event', function() {
  var editor = new Editor();

  editor.hasFocus = true;

  editor.trigger('blur');

  same(editor.hasFocus, false);
});



module('Editor#getValidator');

test('Given a string, a bundled validator is returned', function() {
  var editor = new Editor();

  var required = editor.getValidator('required'),
      email = editor.getValidator('email');
  
  equal(required(null).type, 'required');
  equal(email('invalid').type, 'email');
});

test('Given a string, throws if the bundled validator is not found', 1, function() {
  var editor = new Editor();

  try {
    editor.getValidator('unknown validator');
  } catch (e) {
    equal(e.message, 'Validator "unknown validator" not found');
  }
});

test('Given an object, a customised bundled validator is returned', function() {
  var editor = new Editor();

  //Can customise error message
  var required = editor.getValidator({ type: 'required', message: 'Custom message' });
  
  var err = required('');
  equal(err.type, 'required');
  equal(err.message, 'Custom message');
  
  //Can customise options on certain validators
  var regexp = editor.getValidator({ type: 'regexp', regexp: /foobar/, message: 'Must include "foobar"' });
  
  var err = regexp('invalid');
  equal(err.type, 'regexp');
  equal(err.message, 'Must include "foobar"');
});

test('Given a regular expression, returns a regexp validator', function() {
  var editor = new Editor();

  var regexp = editor.getValidator(/hello/);
  
  equal(regexp('invalid').type, 'regexp');
});

test('Given a function, it is returned', function () {
  var editor = new Editor();

  var myValidator = function () { return; };

  var validator = editor.getValidator(myValidator);

  equal(validator, myValidator);
});

test('Given an unknown type, an error is thrown', 1, function () {    
  var editor = new Editor();

  try {
    editor.getValidator(['array']);
  } catch (e) {
    equal(e.message, 'Invalid validator: array');
  }
});


})(Backbone.Form, Backbone.Form.Editor);
