;(function(Form) {

var same = deepEqual;


module('Form#initialize', {
  setup: function() {
    this.sinon = sinon.sandbox.create();
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('prefers schema from options over model', function() {
  var model = new Backbone.Model();

  model.schema = { fromModel: 'Text' };

  var schema = { fromOptions: 'Text' };

  var form = new Form({
    schema: schema,
    model: model
  });

  same(form.schema, schema);
});

test('prefers schema from options over model - when schema is a function', function() {
  var model = new Backbone.Model();

  model.schema = { fromModel: 'Text' };

  var schema = function() {
    return { fromOptions: 'Text' };
  }

  var form = new Form({
    schema: schema,
    model: model
  });

  same(form.schema, schema());
});

test('uses from model if provided', function() {
  var model = new Backbone.Model();

  model.schema = { fromModel: 'Text' };

  var form = new Form({
    model: model
  });

  same(form.schema, model.schema);
});

test('uses from model if provided - when schema is a function', function() {
  var model = new Backbone.Model();
  
  model.schema = function() {
    return { fromModel: 'Text' };
  }

  var form = new Form({
    model: model
  });

  same(form.schema, model.schema());
});

test('stores important options', function() {
  var options = {
    model: new Backbone.Model(),
    data: { foo: 1 },
    idPrefix: 'foo'
  }

  var form = new Form(options);

  same(form.model, options.model);
  same(form.data, options.data);
  same(form.idPrefix, options.idPrefix);
});

test('overrides defaults', function() {
  var options = {
    template: _.template('<b></b>'),
    Fieldset: Form.Fieldset.extend(),
    Field: Form.Field.extend(),
    NestedField: Form.NestedField.extend()
  };

  var form = new Form(options);

  same(form.template, options.template);
  same(form.Fieldset, options.Fieldset);
  same(form.Field, options.Field);
  same(form.NestedField, options.NestedField);
});

test('uses template stored on form class', function() {
  var oldTemplate = Form.template;

  var newTemplate = _.template('<form><b data-fieldsets></b></div>');

  Form.template = newTemplate;

  var form = new Form();

  same(form.template, newTemplate);

  Form.template = oldTemplate;
});

test('uses fieldset and field classes stored on form class', function() {
  var form = new Form();

  same(form.Fieldset, Form.Fieldset);
  same(form.Field, Form.Field);
  same(form.NestedField, Form.NestedField);
});

test('sets selectedFields - with options.fields', function() {
  var options = {
    fields: ['foo', 'bar']
  };

  var form = new Form(options);

  same(form.selectedFields, options.fields);
});

test('sets selectedFields - defaults to using all fields in schema', function() {
  var form = new Form({
    schema: { name: 'Text', age: 'Number' }
  });

  same(form.selectedFields, ['name', 'age']);
});

test('creates fields', function() {
  this.sinon.spy(Form.prototype, 'createField');

  var form = new Form({
    schema: { name: 'Text', age: { type: 'Number' } }
  });

  same(form.createField.callCount, 2);
  same(_.keys(form.fields), ['name', 'age']);

  //Check createField() was called correctly
  var args = form.createField.args[0],
      keyArg = args[0],
      schemaArg = args[1];

  same(keyArg, 'name');
  same(schemaArg, 'Text');

  var args = form.createField.args[1],
      keyArg = args[0],
      schemaArg = args[1];

  same(keyArg, 'age');
  same(schemaArg, { type: 'Number' });
});

test('creates fieldsets - with "fieldsets" option', function() {
  this.sinon.spy(Form.prototype, 'createFieldset');

  var form = new Form({
    schema: {
      name: 'Text',
      age: { type: 'Number' },
      password: 'Password'
    },
    fieldsets: [
      ['name', 'age'],
      ['password']
    ]
  });

  same(form.createFieldset.callCount, 2);
  same(form.fieldsets.length, 2);

  //Check createFieldset() was called correctly
  var args = form.createFieldset.args[0],
      schemaArg = args[0];

  same(schemaArg, ['name', 'age']);

  var args = form.createFieldset.args[1],
      schemaArg = args[0];

  same(schemaArg, ['password']);
});

test('creates fieldsets - defaults to all fields in one fieldset', function() {  
  this.sinon.spy(Form.prototype, 'createFieldset');

  var form = new Form({
    schema: {
      name: 'Text',
      age: { type: 'Number' },
      password: 'Password'
    }
  });

  same(form.createFieldset.callCount, 1);
  same(form.fieldsets.length, 1);

  //Check createFieldset() was called correctly
  var args = form.createFieldset.args[0],
      schemaArg = args[0];

  same(schemaArg, ['name', 'age', 'password']);
});



module('Form#createFieldset', {
  setup: function() {
    this.sinon = sinon.sandbox.create();
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('creates a new instance of the Fieldset defined on the form', function() {
  var MockFieldset = Backbone.View.extend();
  
  var form = new Form({
    schema: { name: 'Text', age: 'Number' },
    Fieldset: MockFieldset
  });

  this.sinon.spy(MockFieldset.prototype, 'initialize');

  var fieldset = form.createFieldset(['name', 'age']);

  same(fieldset instanceof MockFieldset, true);

  //Check correct options were passed
  var optionsArg = MockFieldset.prototype.initialize.args[0][0];

  same(optionsArg.schema, ['name', 'age']);
  same(optionsArg.fields, form.fields);
});



module('Form#createField', {
  setup: function() {
    this.sinon = sinon.sandbox.create();

    this.MockField = Backbone.View.extend({
      editor: new Backbone.View()
    });
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('creates a new instance of the Field defined on the form - with model', function() {
  var MockField = this.MockField;

  var form = new Form({
    Field: MockField,
    idPrefix: 'foo',
    model: new Backbone.Model()
  });

  this.sinon.spy(MockField.prototype, 'initialize');

  var field = form.createField('name', { type: 'Text' });

  same(field instanceof MockField, true);

  //Check correct options were passed
  var optionsArg = MockField.prototype.initialize.args[0][0];

  same(optionsArg.form, form);
  same(optionsArg.key, 'name');
  same(optionsArg.schema, { type: 'Text' });
  same(optionsArg.idPrefix, 'foo');
  same(optionsArg.model, form.model);
});

test('creates a new instance of the Field defined on the form - without model', function() {
  var MockField = this.MockField;
  
  var form = new Form({
    Field: MockField,
    idPrefix: 'foo',
    data: { name: 'John' }
  });

  this.sinon.spy(MockField.prototype, 'initialize');

  var field = form.createField('name', { type: 'Text' });

  same(field instanceof MockField, true);

  //Check correct options were passed
  var optionsArg = MockField.prototype.initialize.args[0][0];

  same(optionsArg.value, 'John');
});

test('adds listener to all editor events', function() {
  var MockField = this.MockField;
  
  var form = new Form({
    Field: MockField,
    idPrefix: 'foo',
    data: { name: 'John' }
  });

  this.sinon.stub(form, 'handleEditorEvent', function() {});

  var field = form.createField('name', { type: 'Text' });

  //Trigger events on editor to check they call the handleEditorEvent callback
  field.editor.trigger('focus');
  field.editor.trigger('blur');
  field.editor.trigger('change');
  field.editor.trigger('foo');

  same(form.handleEditorEvent.callCount, 4);
});



module('Form#handleEditorEvent', {
  setup: function() {
    this.sinon = sinon.sandbox.create();
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('triggers editor events on the form, prefixed with the key name', function() {
  var form = new Form(),
      editor = new Form.Editor({ key: 'title' });

  var spy = this.sinon.spy();

  form.on('all', spy);

  form.handleEditorEvent('foo', editor);

  same(spy.callCount, 1);

  var args = spy.args[0],
      eventArg = args[0],
      formArg = args[1],
      editorArg = args[2];

  same(eventArg, 'title:foo');
  same(formArg, form);
  same(editorArg, editor);
});

test('triggers general form events', function() {
  var form = new Form(),
      editor = new Form.Editor({ key: 'title' });

  //Change
  var changeSpy = this.sinon.spy()

  form.on('change', changeSpy);
  form.handleEditorEvent('change', editor);

  same(changeSpy.callCount, 1);
  same(changeSpy.args[0][0], form);

  //Focus
  var focusSpy = this.sinon.spy()

  form.on('focus', focusSpy);
  form.handleEditorEvent('focus', editor);

  same(focusSpy.callCount, 1);
  same(focusSpy.args[0][0], form);

  //Blur
  var blurSpy = this.sinon.spy()

  form.hasFocus = true;

  form.on('blur', blurSpy);
  form.handleEditorEvent('blur', editor);

  setTimeout(function() {
    same(blurSpy.callCount, 1);
    same(blurSpy.args[0][0], form);
  }, 0);
});



module('Form#render', {
  setup: function() {
    this.sinon = sinon.sandbox.create();

    this.sinon.stub(Form.editors.Text.prototype, 'render', function() {
      this.setElement($('<input class="'+this.key+'" />'));
      return this;
    });

    this.sinon.stub(Form.Field.prototype, 'render', function() {
      this.setElement($('<field class="'+this.key+'" />'));
      return this;
    });

    this.sinon.stub(Form.Fieldset.prototype, 'render', function() {
      this.setElement($('<fieldset></fieldset>'));
      return this;
    });
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('returns self', function() {
  var form = new Form({
    schema: { name: 'Text', password: 'Password' },
    template: _.template('<div data-fieldsets></div>')
  });

  var returnedValue = form.render();

  same(returnedValue, form);
});

test('with data-editors="*" placeholder, on inner element', function() {
  var form = new Form({
    schema: { name: 'Text', password: 'Password' },
    template: _.template('<div><b data-editors="*"></b></div>')
  }).render();

  same(form.$el.html(), '<b data-editors="*"><input class="name"><input class="password"></b>');
});

test('with data-editors="x,y" placeholder, on outermost element', function() {
  var form = new Form({
    schema: { name: 'Text', password: 'Password' },
    template: _.template('<b data-editors="name,password"></b>')
  }).render();

  same(form.$el.html(), '<input class="name"><input class="password">');
});

test('with data-fields="*" placeholder, on inner element', function() {
  var form = new Form({
    schema: { name: 'Text', password: 'Password' },
    template: _.template('<div><b data-fields="*"></b></div>')
  }).render();

  same(form.$el.html(), '<b data-fields="*"><field class="name"></field><field class="password"></field></b>');
});

test('with data-fields="x,y" placeholder, on outermost element', function() {
  var form = new Form({
    schema: { name: 'Text', password: 'Password' },
    template: _.template('<b data-fields="name,password"></b>')
  }).render();

  same(form.$el.html(), '<field class="name"></field><field class="password"></field>');
});

test('with data-fieldsets placeholder, on inner element', function() {
  var form = new Form({
    schema: { name: 'Text', password: 'Password' },
    template: _.template('<div><b data-fieldsets></b></div>')
  }).render();

  same(form.$el.html(), '<b data-fieldsets=""><fieldset></fieldset></b>');
});

test('with data-fieldsets placeholder, on outermost element', function() {
  var form = new Form({
    schema: { name: 'Text', password: 'Password' },
    template: _.template('<b data-fieldsets></b>')
  }).render();

  same(form.$el.html(), '<fieldset></fieldset>');
});



module('Form#validate');

test('validates the form and returns an errors object', function () {
  var form = new Form({
    schema: {
      title: {validators: ['required']}
    }
  });
  
  var err = form.validate();

  same(err.title.type, 'required');
  same(err.title.message, 'Required');

  form.setValue({title: 'A valid title'});
  same(form.validate(), null);
});

test('returns model validation errors', function() {
  var model = new Backbone.Model;
  
  model.validate = function() {
    return 'FOO';
  };
  
  var form = new Form({
    model: model,
    schema: {
      title: {validators: ['required']}
    }
  });
  
  var err = form.validate();
  
  same(err._others, ['FOO']);
});



module('Form#commit');

test('returns validation errors', function() {
  var form = new Form({
    model: new Backbone.Model()
  });
  
  //Mock
  form.validate = function() {
    return { foo: 'bar' }
  };
  
  var err = form.commit();
  
  same(err.foo, 'bar');
});

test('returns model validation errors', function() {
  var model = new Backbone.Model();
  
  model.validate = function() {
    return 'ERROR';
  };
  
  var form = new Form({
    model: model
  });
  
  var err = form.commit();
  
  same(err._others, ['ERROR']);
});

test('updates the model with form values', function() {
  var model = new Backbone.Model();

  var form = new Form({
    model: model,
    idPrefix: null,
    schema: { title: 'Text' }
  });

  //Change the title in the form and save
  form.setValue('title', 'New title');
  form.commit();

  same(model.get('title'), 'New title');
});

test('triggers model change once', function() {
  var model = new Backbone.Model();

  var form = new Form({
    model: model,
    schema: { title: 'Text', author: 'Text' }
  });
  
  //Count change events
  var timesCalled = 0;
  model.on('change', function() {
    timesCalled ++;
  });
  
  form.setValue('title', 'New title');
  form.setValue('author', 'New author');
  form.commit();
  
  same(timesCalled, 1);
});

test('can silence change event with options', function() {
  var model = new Backbone.Model();

  var form = new Form({
    model: model,
    schema: { title: 'Text', author: 'Text' }
  });
    
  //Count change events
  var timesCalled = 0;
  model.on('change', function() {
    timesCalled ++;
  });

  form.setValue('title', 'New title');

  form.commit({ silent: true });

  same(timesCalled, 0);
});



module('Form#getValue');

test('returns form value as an object', function() {
  var data = {
    title: 'Nooope', 
    author: 'Lana Kang'
  };

  var form = new Form({
    data: data,
    schema: {
      title: {},
      author: {}
    }
  }).render();
  
  var result = form.getValue();
  
  same(result.title, 'Nooope');
  same(result.author, 'Lana Kang');
});

test('returns specific field value', function() {
  var data = {
    title: 'Danger Zone!', 
    author: 'Sterling Archer'
  };

  var form = new Form({
    data: data,
    schema: {
      title: {},
      author: {}
    }
  }).render();
  
  same(form.getValue('title'), 'Danger Zone!');
});



module('Form#getEditor');

test('returns the editor for a given key', function() {
  var form = new Form({
    schema: { title: 'Text', author: 'Text' }
  });

  same(form.getEditor('author'), form.fields.author.editor);
});



module('Form#focus', {
  setup: function() {
    this.sinon = sinon.sandbox.create();
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('Sets focus on the first editor in the form', function() {
  var form = new Form({
    schema: { title: 'Text', author: 'Text' },
    fieldsets: [
      ['title'], ['author']
    ]
  });

  this.sinon.spy(form.fields.title.editor, 'focus');

  form.focus();

  same(form.fields.title.editor.focus.callCount, 1);
});



module('Form#blur', {
  setup: function() {
    this.sinon = sinon.sandbox.create();
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('Removes focus from the currently focused editor', function() {
  var form = new Form({
    schema: { title: 'Text', author: 'Text' }
  });

  form.hasFocus = true;

  form.fields.author.editor.hasFocus = true;

  this.sinon.spy(form.fields.author.editor, 'blur');

  form.blur();

  same(form.fields.author.editor.blur.callCount, 1);
});



module('Form#trigger');

test('Sets hasFocus to true on focus event', function() {
  var form = new Form();

  form.hasFocus = false;

  form.trigger('focus');

  same(form.hasFocus, true);
});

test('Sets hasFocus to false on blur event', function() {
  var form = new Form();

  form.hasFocus = true;

  form.trigger('blur');

  same(form.hasFocus, false);
});



module('Form#remove', {
  setup: function() {
    this.sinon = sinon.sandbox.create();

    this.sinon.spy(Form.Fieldset.prototype, 'remove');
    this.sinon.spy(Form.Field.prototype, 'remove');
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('removes fieldsets, fields and self', function() {  
  var form = new Form({
    schema: { title: 'Text', author: 'Text' },
    fieldsets: [
      ['title', 'author']
    ]
  });
  
  form.remove();
  
  same(Form.Fieldset.prototype.remove.callCount, 1);

  //Field.remove is called twice each because is called directly and through fieldset
  //This is done in case fieldsets are not used, e.g. fields are included directly through template
  same(Form.Field.prototype.remove.callCount, 4);
});

})(Backbone.Form);
