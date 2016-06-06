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

test('first, uses template defined in options', function() {
  var optionsTemplate = _.template('<div class="options" data-editor></div>'),
      schemaTemplate = _.template('<div class="schema" data-editor></div>'),
      protoTemplate = _.template('<div class="prototype" data-editor></div>'),
      constructorTemplate = _.template('<div class="constructor" data-editor></div>');

  var CustomField = Field.extend({
    template: protoTemplate
  }, {
    template: constructorTemplate
  });

  var field = new CustomField({
    key: 'title',
    template: optionsTemplate,
    schema: { type: 'Text', template: schemaTemplate }
  });

  same(field.template, optionsTemplate);
});

test('second, uses template defined in schema', function() {
  var schemaTemplate = _.template('<div class="schema" data-editor></div>'),
      protoTemplate = _.template('<div class="prototype" data-editor></div>'),
      constructorTemplate = _.template('<div class="constructor" data-editor></div>');

  var CustomField = Field.extend({
    template: protoTemplate
  }, {
    template: constructorTemplate
  });

  var field = new CustomField({
    key: 'title',
    schema: { type: 'Text', template: schemaTemplate }
  });

  same(field.template, schemaTemplate);
});

test('third, uses template defined on prototype', function() {
  var protoTemplate = _.template('<div class="prototype" data-editor></div>'),
      constructorTemplate = _.template('<div class="constructor" data-editor></div>');

  var CustomField = Field.extend({
    template: protoTemplate
  }, {
    template: constructorTemplate
  });

  var field = new CustomField({
    key: 'title',
    schema: { type: 'Text' }
  });

  same(field.template, protoTemplate);
});

test('fourth, uses template defined on constructor', function() {
  var constructorTemplate = _.template('<div class="constructor" data-editor></div>');

  var CustomField = Field.extend({
  }, {
    template: constructorTemplate
  });

  var field = new CustomField({
    key: 'title',
    schema: { type: 'Text' },
  });

  same(field.template, constructorTemplate);
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

test('only renders the editor if noField property is true', function() {
  var field = new Field({
    key: 'title',
    schema: { type: 'Hidden' }
  }).render();

  same(field.$el.prop('tagName'), 'INPUT');
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



module('Field#disable', {
  setup: function() {
    this.sinon = sinon.sandbox.create();
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('Calls disable on editor if method exists', function() {
  Form.editors.Disabler = Form.editors.Text.extend({
    disable: function(){}
  });
  var field = new Field({
    schema: { type: "Disabler" },
    key: 'title'
  });

  this.sinon.spy(field.editor, 'disable');

  field.disable();

  same(field.editor.disable.callCount, 1);
});

test('If disable method does not exist on editor, disable all inputs inside it', function() {
  var field = new Field({ key: 'title' });

  field.render();

  field.disable();

  same(field.$(":input").is(":disabled"),true);
});

test('Will disable all inputs inside editor by default', function() {
  var field = new Field({ key: 'title',
    schema: {
      type: 'DateTime',
      value: Date.now()
    }
  });

  field.render();

  field.disable();

  same(field.$("select").is(":disabled"),true);
  same(field.$("input").is(":disabled"),true);
});

module('Field#enable', {
  setup: function() {
    this.sinon = sinon.sandbox.create();
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('Calls enable on editor if method exists', function() {
  Form.editors.Enabler = Form.editors.Text.extend({
    enable: function(){}
  });
  var field = new Field({
    schema: { type: "Enabler" },
    key: 'title'
  });

  this.sinon.spy(field.editor, 'enable');

  field.enable();

  same(field.editor.enable.callCount, 1);
});

test('If enable method does not exist on editor, enable all inputs inside it', function() {
  var field = new Field({ key: 'title' });

  field.$(":input").attr("disabled",true);

  field.render();

  field.enable();

  same(field.$(":input").is(":disabled"),false);
});

test('Will enable all inputs inside editor by default', function() {
  var field = new Field({ key: 'title',
    schema: {
      type: 'DateTime',
      value: Date.now()
    }
  });

  field.$(":input").attr("disabled",true);

  field.render();

  field.enable();

  same(field.$("select").is(":disabled"),false);
  same(field.$("input").is(":disabled"),false);
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



module('Field#escape title text');

test('Title HTML gets escaped by default', function() {
  var field = new Field({
    key: 'XSS',
    schema: {
      title: '      "/><script>throw("XSS Success");</script>      '
    }
  }).render();

  same( field.$('label').text(), '              \"/><script>throw(\"XSS Success\");</script>            ' );
  same( field.$('label').html(), '              \"/&gt;&lt;script&gt;throw(\"XSS Success\");&lt;/script&gt;            ' );
});

test('TitleHTML property can be set to true to allow HTML through', function() {
  var field = new Field({
    key: 'XSS',
    schema: {
      titleHTML: '<b>some HTML</b>',
      title: 'will be ignored'
    }
  }).render();

  same( field.$('label').text(), '        some HTML              ' );
  same( field.$('label').html(), '        <b>some HTML</b>              ' );
});

})(Backbone.Form, Backbone.Form.Field);
