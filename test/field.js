;(function(Form, Field, editors) {



module('Field');

test("'schema' option - can be a string representing the type", function() {
  var field = new Field({
    key: 'age',
    value: 30,
    schema: 'Number'
  }).render();

  ok(field.editor instanceof editors.Number);
});

test("'schema.type' option - Specifies editor to use", function() {
    var field = new Field({
        value: 'test',
        key: 'title',
        schema: { type: 'Text' }
    }).render();
    
    ok(field.editor instanceof editors.Text);
    
    var field = new Field({
        value: 'test',
        key: 'title',
        schema: { type: 'Number' }
    }).render();
    
    ok(field.editor instanceof editors.Number);
});

test("'schema.type' option - Defaults to 'Text'", function() {
    var field = new Field({
        value: 'test',
        key: 'title',
        schema: {}
    }).render();
    
    ok(field.editor instanceof editors.Text);
});

test("'schema.title' option - Populates the <label>", function() {
    var field = new Field({
        value: 'test',
        key: 'title',
        schema: { title: 'Post Title' }
    }).render();
    
    equal($('label', field.el).html(), 'Post Title');
});

test("'schema.title' option - Defaults to formatted version of 'key' option", function() {
    var field = new Field({
        value: 'test',
        key: 'title',
        schema: {}
    }).render();
    
    equal($('label', field.el).html(), 'Title');
    
    var field = new Field({
        value: 'test',
        key: 'camelCasedTitle',
        schema: {}
    }).render();
    
    equal($('label', field.el).html(), 'Camel Cased Title');
});

test("'schema.title' false option - does not render a <label>", function() {
    var field = new Field({
        value: 'test',
        key: 'title',
        schema: { title: false }
    }).render();

    equal($('label', field.el).length, 0);
});

test("'schema.help' option - Specifies help text", function() {
  var field = new Field({
    key: 'title',
    schema: { help: 'Some new help text' }
  }).render();
  
  equal($('.bbf-help', field.el).html(), 'Some new help text');
});

test("'schema.fieldClass' option - Adds class names to field", function() {
  var field = new Field({
    key: 'title',
    schema: { fieldClass: 'foo bar' }
  }).render();
  
  ok(field.$el.hasClass('bbf-field'), 'Doesnt overwrite default classes');
  ok(field.$el.hasClass('foo'), 'Adds first defined class');
  ok(field.$el.hasClass('bar'), 'Adds other defined class');
})

test("'schema.fieldAttrs' option - Adds custom attributes", function() {
  var field = new Field({
    key: 'title',
    schema: {
      fieldAttrs: {
        maxlength: 30,
        type: 'foo',
        custom: 'hello'
      }
    }
  }).render();
  
  var $el = field.$el;
  
  equal($el.attr('maxlength'), 30);
  equal($el.attr('type'), 'foo');
  equal($el.attr('custom'), 'hello');
})

test("'schema.template' option - Specifies template", function() {
  Form.templates.custom = Form.helpers.createTemplate('<div class="custom-field"></div>');
  
  var field = new Field({
    key: 'title',
    schema: { template: 'custom' }
  }).render();
  
  ok(field.$el.hasClass('custom-field'));
})

test("'model' option - Populates the field with the given 'key' option from the model", function() {
    var field = new Field({
        model: new Post,
        key: 'title',
        idPrefix: null
    }).render();
    
    equal($('#title', field.el).val(), 'Danger Zone!');
});

test("'value' option - Populates the field", function() {
    var field = new Field({
        value: 'test',
        key: 'title'
    }).render();
    
    equal($('#title', field.el).val(), 'test');
});

test("'idPrefix' option - Specifies editor's DOM element ID prefix", function() {
    var field = new Field({
        value: 'test',
        key: 'title',
        idPrefix: 'prefix_'
    }).render();
    
    equal($('#prefix_title', field.el).length, 1);
});


test("commit() - Calls editor commit", function() {
  expect(1);
  
  var field = new Field({
    key: 'title'
  }).render();
  
  //Mock
  var called = false;
  field.editor.commit = function() {
    called = true;
  };

  field.commit();
  
  ok(called, 'Called editor.commit');
});

test("getValue() - Returns the new value", function() {
    var field = new Field({
        value: 'Initial Title',
        key: 'title'
    }).render();
    
    //Change field value
    $('#title', field.el).val('New Title');
    
    equal(field.getValue(), 'New Title');
});

test("setValue() - Sets the new value", function() {
    var field = new Field({
        value: 'Initial Title',
        key: 'title'
    }).render();
    
    field.setValue('New Title');
    
    equal(field.getValue(), 'New Title');
});

test("remove() - Removes the editor view", function() {
    var counter = 0;
    
    //Mock out the remove method so we can tell how many times it was called
    var _remove = Backbone.View.prototype.remove;
    Backbone.View.prototype.remove = function() {
        counter++;
    }
    
    var field = new Field({
        model: new Post,
        key: 'title'
    }).render();
    
    field.remove();
    
    //remove() should have been called twice (once for the editor and once for the field)
    equal(counter, 2);
    
    //Restore remove method
    Backbone.View.prototype.remove = _remove;
});

test('commit() - sets value to model', function() {
  var post = new Post;

  var field = new Field({
    model: post,
    key: 'title'
  }).render();

  //Change value
  field.setValue('New Title');

  field.commit();

  equal(post.get('title'), 'New Title');
});

test('validate() - calls setError if validation fails', function() {
  expect(3);

  var field = new Field({
    key: 'title',
    schema: { validators: ['required'] }
  }).render();
  
  //Mocks
  var calledSetError = false,
      errMsg = null;
      
  field.setError = function(msg) {
    calledSetError = true;
    errMsg = msg;
  }
  
  //Make validation fail
  field.setValue(null);
  var err = field.validate();
  
  //Test
  ok(calledSetError, 'calledSetError');
  deepEqual(err, {
    type: 'required',
    message: 'Required'
  });
  equal(errMsg, err.message);
});

test('validate() - calls clearError if validation passes', function() {
  expect(1);

  var field = new Field({
    key: 'title',
    schema: { validators: ['required'] }
  }).render();
  
  //Trigger error to appear
  field.setValue(null);
  field.validate();
  
  //Mocks
  var calledClearError = false;
  field.clearError = function(msg) {
    calledClearError = true;
  }
  
  //Trigger validation to pass
  field.setValue('ok');
  field.validate();
  
  //Test
  ok(calledClearError, 'calledClearError');
});

test('setError() - sets field error class name and error message', function() {
  var errorClass = Form.classNames.error;

  var field = new Field({
    key: 'title',
    schema: { validators: ['required'] }
  }).render();
  
  field.setError('foo');
  ok($(field.el).hasClass(errorClass));
  equal(field.$error.html(), 'foo');
});

test('setError() - returns if the editor is a "nested" type', function() {
  var errorClass = Form.classNames.error;

  var field = new Field({
    key: 'nested',
    schema: { type: 'Object', subSchema: { title: {} } }
  }).render();
  
  field.setError('foo');
  
  equal($(field.el).hasClass(errorClass), false);
});

test('clearError() - clears error class and resets help message', function() {
  var errorClass = Form.classNames.error;
  
  var field = new Field({
    key: 'email',
    schema: { validators: ['email'], help: 'Help message' }
  }).render();
  
  //Trigger error message
  field.setError('foo')
  
  //Clear error message
  field.clearError();
  
  //Test
  equal($(field.el).hasClass(errorClass), false);
  equal(field.$help.html(), 'Help message');
});

test('getId() - uses idPrefix if defined', function() {
  var stringPrefixField = new Field({
    idPrefix: 'foo_',
    key: 'name'
  });
  
  var numberPrefixField = new Field({
    idPrefix: 123,
    key: 'name'
  });
  
  equal(numberPrefixField.getId(), '123name');
});

test('getId() - adds no prefix if idPrefix is null', function() {
  var field = new Field({
    idPrefix: null,
    key: 'name'
  });
  
  equal(field.getId(), 'name');
});

test('getId() - uses model cid if no idPrefix is set', function() {
  var field = new Field({
    key: 'name',
    model: { cid: 'foo' }
  });
  
  equal(field.getId(), 'foo_name');
});

test('getId() - adds no prefix if idPrefix is null and there is no model', function() {
  var field = new Field({
    key: 'name'
  });
  
  equal(field.getId(), 'name');
});

test('getId() - replaces periods with underscores', function() {
  var field = new Field({
    key: 'user.name.first'
  });

  equal(field.getId(), 'user_name_first');
});

test("keys can be paths to nested objects if using DeepModel", function() {
  var model = new Backbone.DeepModel({
    user: {
      name: {
        first: 'Stan',
        last: 'Marsh'
      }
    }
  });

  var field = new Field({
    key: 'user.name.first',
    model: model,
    idPrefix: null
  }).render();

  field.setValue('foo');

  var $input = field.$('#user_name_first');

  equal(field.getValue(), 'foo');
  equal($input.val(), 'foo');
  equal($input.attr('name'), 'user_name_first');

  //TODO: Test with DeepModel
  field.commit();
  equal(model.attributes.user.name.first, 'foo');
});



})(Backbone.Form, Backbone.Form.Field, Backbone.Form.editors);
