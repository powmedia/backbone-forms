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

test('accepts an errorClassName in schema', function() {
  var form = new Form({
    schema: {
      name: {type: 'Text', errorClassName: 'custom-error'}
    }
  });
  same(form.fields.name.errorClassName, 'custom-error')
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

test('uses schema from model if provided', function() {
  var model = new Backbone.Model();

  model.schema = { fromModel: 'Text' };

  var form = new Form({
    model: model
  });

  same(form.schema, model.schema);
});

test('uses fieldsets from model if provided', function() {
  var model = new Backbone.Model();

  model.schema = { fromModel: 'Text' };
  model.fieldsets = [{legend: 'from model',
                      fields: ['fromModel']}];

  var form = new Form({
    model: model
  });

  same(form.fieldsets[0].schema, model.fieldsets[0]);
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
    idPrefix: 'foo',
    templateData: { bar: 2 }
  }

  var form = new Form(options);

  same(form.model, options.model);
  same(form.data, options.data);
  same(form.idPrefix, options.idPrefix);
  same(form.templateData, options.templateData);
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

test('prefers template stored on form prototype over one stored on class', function() {
  var oldTemplate = Form.template;

  var newTemplate = _.template('<form><b data-fieldsets></b></div>');

  Form.prototype.template = newTemplate;

  var form = new Form();

  same(form.template, newTemplate);

  delete Form.prototype.template;
});

test('uses template stored on form class', function() {
  var oldTemplate = Form.template;

  var newTemplate = _.template('<form><b data-fieldsets></b></div>');

  Form.template = newTemplate;

  var form = new Form();

  same(form.template, newTemplate);

  Form.template = oldTemplate;
});

test('uses fieldset and field classes stored on prototype over those stored on form class', function() {
  var DifferentField = function () {};
  var DifferentFieldset = function () {};
  var DifferentNestedField = function () {};

  Form.prototype.Field = DifferentField;
  Form.prototype.Fieldset = DifferentFieldset;
  Form.prototype.NestedField = DifferentNestedField;

  var form = new Form();

  same(form.Fieldset, DifferentFieldset);
  same(form.Field, DifferentField);
  same(form.NestedField, DifferentNestedField);

  delete Form.prototype.Field;
  delete Form.prototype.Fieldset;
  delete Form.prototype.NestedField;
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

test('creates fieldsets - first with "fieldsets" option', function() {
  this.sinon.spy(Form.prototype, 'createFieldset');

  var MyForm = Form.extend({
    schema: {
      name: 'Text',
      age: { type: 'Number' },
      password: 'Password'
    },

    fieldsets: [
      ['age', 'name']
    ]
  });

  var form = new MyForm({
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

test('creates fieldsets - second with prototype.fieldsets', function() {
  this.sinon.spy(Form.prototype, 'createFieldset');

  var MyForm = Form.extend({
    schema: {
      name: 'Text',
      age: { type: 'Number' },
      password: 'Password'
    },

    fieldsets: [
      ['age', 'name']
    ]
  });

  var form = new MyForm();

  same(form.createFieldset.callCount, 1);
  same(form.fieldsets.length, 1);

  //Check createFieldset() was called correctly
  var args = form.createFieldset.args[0],
      schemaArg = args[0];

  same(schemaArg, ['age', 'name']);
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

test('submitButton option: missing - does not create button', function() {
  var form = new Form({
    schema: { name: 'Text' }
  }).render();

  var $btn = form.$('button');

  same($btn.length, 0);
});

test('submitButton option: false - does not create button', function() {
  var form = new Form({
    schema: { name: 'Text' },
    submitButton: false
  }).render();

  var $btn = form.$('button');

  same($btn.length, 0);
});

test('submitButton option: string - creates button with given text', function() {
  var form = new Form({
    schema: { name: 'Text' },
    submitButton: 'Next'
  }).render();

  var $btn = form.$('button[type="submit"]');

  same($btn.length, 1);
  same($btn.html(), 'Next');
});

test('submitButton still rendered properly if _ templateSettings are changed', function() {
    var oldSettings = _.templateSettings;

    _.templateSettings = {
        evaluate: /\{\{([\s\S]+?)\}\}/g,
        interpolate: /\{\{=([\s\S]+?)\}\}/g,
        escape: /\{\{-([\s\S]+?)\}\}/g
    };

  var form = new Form({
    schema: { name: 'Text' },
    submitButton: 'Next'
  }).render();

  var $btn = form.$('button[type="submit"]');

  same($btn.length, 1);
  same($btn.html(), 'Next');
  notDeepEqual( _.templateSettings, Form.templateSettings, "Template settings should be different");

  _.templateSettings = oldSettings;
});

test('Uses Backbone.$ not global', function() {
  var old$ = window.$,
    exceptionCaught = false;

  window.$ = null;

  try {
     var form = new Form({
      schema: { name: 'Text' },
      submitButton: 'Next'
    }).render();
  } catch(e) {
    exceptionCaught = true;
  }

  window.$ = old$;

  ok(!exceptionCaught, ' using global \'$\' to render');
});


module('Form#EditorValues');

test('Form with editor with basic schema should return defaultValues', function() {
  var form = new Form({
    schema: {
      name: {
        type: 'Text'
      }
    }
  }).render();

  same( form.fields.name.editor.value, "" );
  same( form.getValue(), { name: "" } );
});

test('Form with model with defaults should return defaults', function() {
  var model = Backbone.Model.extend({
    defaults: { name: "Default Name" }
  });
  var form = new Form({
    schema: {
      name: {
        type: 'Text'
      }
    },
    model: new model()
  }).render();

  same( form.fields.name.editor.value, "Default Name" );
  same( form.getValue(), { name: "Default Name" } );
});

test('Form with data passed in should return data', function() {
  var form = new Form({
    schema: {
      name: {
        type: 'Text'
      }
    },
    data: { name: "Default Name" }
  }).render();

  same( form.fields.name.editor.value, "Default Name" );
  same( form.getValue(), { name: "Default Name" } );
});

test('Form should not clobber defaultValue of Editors', function() {
  Form.editors.DefaultText = Form.editors.Text.extend({
    defaultValue: "Default Name"
  });
  var form = new Form({
    schema: {
      name: {
        type: 'DefaultText'
      }
    }
  }).render();

  same( form.fields.name.editor.value, "Default Name" );
  same( form.getValue(), { name: "Default Name" } );
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

test('editor events can be triggered with any number of arguments', function() {
  var MockField = this.MockField;

  var form = new Form({
    Field: MockField,
    idPrefix: 'foo',
    data: { name: 'John' }
  });

  this.sinon.stub(form, 'trigger', function() { console.log(arguments)});

  var field = form.createField('name', { type: 'Text' });

  //Trigger events on editor to check they call the handleEditorEvent callback
  form.handleEditorEvent('focus', field.editor, 'arg1', 'arg2');

  same(form.trigger.calledWith('undefined:focus', form, field.editor, ['arg1', 'arg2']), true);
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

test('triggers the submit event', function() {
  var form = new Form();

  var spy = sinon.spy(),
      submitEvent;

  form.on('submit', function(event) {
    submitEvent = event;
    spy(event);
  });

  form.$el.submit();

  same(spy.callCount, 1);
  same(spy.args[0][0], submitEvent);
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

test('with attributes on form element', function() {
  var form = new Form({
    attributes: {
      autocomplete: "off"
    },
    schema: { name: 'Text', password: 'Password' }
  }).render();
  same(form.$el.attr("autocomplete"), "off");
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

test('returns model validation errors by default', function() {
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

test('skips model validation if { skipModelValidate: true } is passed', function() {
  var model = new Backbone.Model();

  model.validate = function() {
    return 'ERROR';
  };

  var form = new Form({
    model: model
  });

  var err = form.validate({ skipModelValidate: true });

  same(err, null);
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

test('does not return  model validation errors by default', function() {
  var model = new Backbone.Model();

  model.validate = function() {
    return 'ERROR';
  };

  var form = new Form({
    model: model
  });

  var err = form.commit();

  same(err, undefined);
});

test('returns model validation errors when { validate: true } is passed', function() {
  var model = new Backbone.Model();

  model.validate = function() {
    return 'ERROR';
  };

  var form = new Form({
    model: model
  });

  var err = form.commit({ validate: true });

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
