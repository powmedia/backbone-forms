;(function(Form, Field) {

var same = deepEqual;


module('Field#initialize', {
  setup: function() {
    this.sinon = sinon.sandbox.create();
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('overrides defaults', function() {
  var options = {
    key: 'title',
    template: _.template('<b></b>'),
    errorClassName: 'ERR'
  };

  var field = new Field(options);

  same(field.template, options.template);
  same(field.errorClassName, 'ERR');
});

test('stores important options', function() {
  var options = {
    key: 'foo',
    form: new Form(),
    model: new Backbone.Model(),
    value: { foo: 1 },
    idPrefix: 'foo'
  }

  var field = new Field(options);

  same(field.key, options.key);
  same(field.form, options.form);
  same(field.model, options.model);
  same(field.value, options.value);
  same(field.idPrefix, options.idPrefix);
});

test('creates the schema', function() {
  this.sinon.spy(Field.prototype, 'createSchema');

  var options = {
    key: 'title',
    schema: { type: 'Text', title: 'Title' }
  };

  var field = new Field(options);

  same(field.createSchema.callCount, 1);
  same(field.createSchema.args[0][0], options.schema);
  same(field.schema.type, Form.editors.Text);
  same(field.schema.title, 'Title');
});

test('creates the editor', function() {
  this.sinon.spy(Field.prototype, 'createEditor');

  var field = new Field({
    key: 'title',
    schema: { type: 'Text' }
  });

  same(field.createEditor.callCount, 1);
  same(field.editor instanceof Form.editors.Text, true);
});



module('Field#createSchema');

test('converts strings to full schemas', function() {
  var field = new Field({ key: 'title' });

  var schema = field.createSchema('Text');

  same(schema.type, Form.editors.Text);
  same(schema.title, 'Title');
});

test('applies defaults', function() {
  var field = new Field({ key: 'age' });

  var schema = field.createSchema({ type: 'Number' });

  same(schema.type, Form.editors.Number);
  same(schema.title, 'Age');
});



module('Field#createEditor', {
  setup: function() {
    this.sinon = sinon.sandbox.create();
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('creates a new instance of the Editor defined in the schema', function() {  
  var field = new Field({
    key: 'password',
    schema: { type: 'Password' },
    form: new Form(),
    idPrefix: 'foo',
    model: new Backbone.Model(),
    value: '123'
  });

  this.sinon.spy(Form.editors.Password.prototype, 'initialize');

  var editor = field.createEditor(field.schema);

  same(editor instanceof Form.editors.Password, true);

  //Check correct options were passed
  var optionsArg = Form.editors.Password.prototype.initialize.args[0][0];

  same(optionsArg.schema, field.schema);
  same(optionsArg.key, field.key);
  same(optionsArg.id, field.createEditorId());
  same(optionsArg.form, field.form);
  same(optionsArg.model, field.model);
  same(optionsArg.value, field.value);
});



module('Field#createEditorId');

test('uses idPrefix if defined', function() {
  var stringPrefixField = new Field({
    idPrefix: 'foo_',
    key: 'name'
  });
  
  var numberPrefixField = new Field({
    idPrefix: 123,
    key: 'name'
  });
  
  same(numberPrefixField.createEditorId(), '123name');
});

test('adds no prefix if idPrefix is null', function() {
  var field = new Field({
    idPrefix: null,
    key: 'name'
  });
  
  same(field.createEditorId(), 'name');
});

test('uses model cid if no idPrefix is set', function() {
  var model = new Backbone.Model();
  model.cid = 'foo';

  var field = new Field({
    key: 'name',
    model: model
  });
  
  same(field.createEditorId(), 'foo_name');
});

test('adds no prefix if idPrefix is null and there is no model', function() {
  var field = new Field({
    key: 'name'
  });
  
  same(field.createEditorId(), 'name');
});

test('replaces periods with underscores', function() {
  var field = new Field({
    key: 'user.name.first'
  });

  same(field.createEditorId(), 'user_name_first');
});



module('Field#createTitle');

test('Transforms camelCased string to words', function() {
  var field = new Field({ key: 'camelCasedString' });

  same(field.createTitle(), 'Camel Cased String');
});



module('Field#templateData');

test('returns schema and template data', function() {
  var field = new Field({
    key: 'author',
    schema: { type: 'Text', help: 'Help!' }
  });

  var data = field.templateData();

  same(data.editorId, 'author');
  same(data.help, 'Help!');
  same(data.key, 'author');
  same(data.title, 'Author');
});



module('Field#render', {
  setup: function() {
    this.sinon = sinon.sandbox.create();

    this.sinon.stub(Form.editors.Text.prototype, 'render', function() {
      this.setElement($('<input class="'+this.key+'" />'));
      return this;
    });
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('returns self', function() {
  var field = new Field({
    key: 'title',
    schema: { type: 'Text' },
    template: _.template('<div data-editor></div>')
  });

  var returnedValue = field.render();

  same(returnedValue, field);
});

test('with data-editor and data-error placeholders', function() {
  var field = new Field({
    key: 'title',
    schema: { type: 'Text' },
    template: _.template('<div><%= title %><b data-editor></b><i data-error></i></div>', null, Form.templateSettings)
  }).render();

  same(field.$el.html(), 'Title<b data-editor=""><input class="title"></b><i data-error=""></i>');
});



module('Field#validate', {
  setup: function() {
    this.sinon = sinon.sandbox.create();
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('calls setError if validation fails', 4, function() {
  var field = new Field({
    key: 'title',
    schema: { validators: ['required'] }
  });

  this.sinon.spy(field, 'setError');
  
  //Make validation fail
  field.setValue(null);
  var err = field.validate();
  
  //Test
  same(field.setError.callCount, 1);
  same(field.setError.args[0][0], 'Required');

  same(err.type, 'required');
  same(err.message, 'Required');
});

test('calls clearError if validation passes', 1, function() {
  var field = new Field({
    key: 'title',
    schema: { validators: ['required'] }
  });

  this.sinon.spy(field, 'clearError');
  
  //Trigger error to appear
  field.setValue(null);
  field.validate();
    
  //Trigger validation to pass
  field.setValue('ok');
  field.validate();
  
  //Test
  same(field.clearError.callCount, 1);
});



module('Field#setError');

test('exits if field hasNestedForm', function() {
  var field = new Field({ key: 'title' });

  field.errorClassName = 'error';
  field.editor.hasNestedForm = true;

  field.render();
  field.setError('foo');

  same(field.$el.hasClass('error'), false);
});

test('adds error CSS class to field element', function() {
  var field = new Field({ key: 'title' });

  field.errorClassName = 'ERR';

  field.render();
  field.setError('foo');

  same(field.$el.hasClass('ERR'), true);
});

test('adds error message to data-error placeholder', function() {
  var field = new Field({ key: 'title' });

  field.render();
  field.setError('Some error');

  same(field.$('[data-error]').html(), 'Some error');
});



module('Field#clearError');

test('removes the error CSS class from field element', function() {
  var field = new Field({ key: 'title' });

  field.errorClassName = 'ERR';

  //Set error
  field.render();
  field.setError('foo');

  //Clear error
  field.clearError();

  //Test
  same(field.$el.hasClass('ERR'), false);
});

test('removes error message from data-error placeholder', function() {
  var field = new Field({ key: 'title' });

  //Set error
  field.render();
  field.setError('Some error');

  //Clear error
  field.clearError();

  //Test
  same(field.$('[data-error]').html(), '');
});



module('Field#commit', {
  setup: function() {
    this.sinon = sinon.sandbox.create();
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('Calls editor commit', function() {
  var field = new Field({
    key: 'title',
    model: new Backbone.Model()
  });

  this.sinon.spy(field.editor, 'commit');

  field.commit();
  
  same(field.editor.commit.callCount, 1);
});

test('Returns error from validation', function() {
  var field = new Field({
    key: 'title',
    model: new Backbone.Model()
  });

  this.sinon.stub(field.editor, 'commit', function() {
    return { type: 'required' }
  });

  var result = field.commit();
  
  same(result, { type: 'required' });
});



module('Field#getValue', {
  setup: function() {
    this.sinon = sinon.sandbox.create();
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('Returns the value from the editor', function() {
    var field = new Field({
      value: 'The Title',
      key: 'title'
    }).render();

    this.sinon.spy(field.editor, 'getValue');

    var result = field.getValue();
    
    same(field.editor.getValue.callCount, 1);
    same(result, 'The Title');
});



module('Field#setValue', {
  setup: function() {
    this.sinon = sinon.sandbox.create();
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('Passes the new value to the editor', function() {
    var field = new Field({ key: 'title' });

    this.sinon.spy(field.editor, 'setValue');
    
    field.setValue('New Title');
    
    same(field.editor.setValue.callCount, 1);
    same(field.editor.setValue.args[0][0], 'New Title');
});



module('Field#focus', {
  setup: function() {
    this.sinon = sinon.sandbox.create();
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('Calls focus on editor', function() {
  var field = new Field({ key: 'title' });

  this.sinon.spy(field.editor, 'focus');
  
  field.focus();
  
  same(field.editor.focus.callCount, 1);
});



module('Field#blur', {
  setup: function() {
    this.sinon = sinon.sandbox.create();
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('Calls focus on editor', function() {
  var field = new Field({ key: 'title' });

  this.sinon.spy(field.editor, 'blur');
  
  field.blur();
  
  same(field.editor.blur.callCount, 1);
});



module('Field#remove', {
  setup: function() {
    this.sinon = sinon.sandbox.create();
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('Removes the editor', function() {
  var field = new Field({ key: 'title' });

  this.sinon.spy(field.editor, 'remove');

  field.remove();

  same(field.editor.remove.callCount, 1);
});

test('Removes self', function() {
  var field = new Field({ key: 'title' });

  this.sinon.spy(Backbone.View.prototype, 'remove');

  field.remove();

  //Called once for editor and once for field:
  same(Backbone.View.prototype.remove.callCount, 2);
});


})(Backbone.Form, Backbone.Form.Field);
