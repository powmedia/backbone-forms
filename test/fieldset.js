;(function(Form, Fieldset) {

var same = deepEqual;

module('Fieldset#initialize', {
  setup: function() {
    this.sinon = sinon.sandbox.create();
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('creates the schema', function() {
  this.sinon.spy(Fieldset.prototype, 'createSchema');

  var fields = {
    title: new Form.Field({ key: 'title' }),
    author: new Form.Field({ key: 'author' })
  };

  var options = {
    fields: fields,
    schema: { legend: 'Test', fields: ['title', 'author'] }
  };

  var fs = new Fieldset(options);

  same(fs.createSchema.callCount, 1);
  same(fs.createSchema.args[0][0], options.schema);
  same(fs.schema, options.schema);
});

test('stores fields defined in the schema', function() {
  var fields = {
    title: new Form.Field({ key: 'title' }),
    author: new Form.Field({ key: 'author' })
  };

  var options = {
    fields: fields,
    schema: ['title', 'author']
  };

  var fs = new Fieldset(options);

  same(_.keys(fs.fields), ['title', 'author']);
});

test('overrides defaults', function() {
  var options = {
    fields: { title: new Form.Field({ key: 'title' }) },
    schema: ['title'],
    template: _.template('<b></b>')
  };

  var fs = new Fieldset(options);

  same(fs.template, options.template);
});



module('Fieldset#createSchema', {
  setup: function() {
    this.sinon = sinon.sandbox.create();
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('converts an array schema into an object with legend', function() {
  var options = {
    fields: {
      title: new Form.Field({ key: 'title' }),
      author: new Form.Field({ key: 'author' })
    },
    schema: ['title', 'author']
  };

  var fs = new Fieldset(options);

  var schema = fs.createSchema(options.schema);

  same(schema, { legend:null, fields: ['title', 'author'] });
});

test('returns fully formed schema as is', function() {
  var options = {
    fields: {
      title: new Form.Field({ key: 'title' }),
      author: new Form.Field({ key: 'author' })
    },
    schema: { legend: 'Main', fields: ['title', 'author'] }
  }

  var fs = new Fieldset(options);

  var schema = fs.createSchema(options.schema);

  same(schema, options.schema);
});



module('Fieldset#getFieldAt');

test('returns field at a given index', function() {
  var fs = new Fieldset({
    fields: {
      title: new Form.Field({ key: 'title' }),
      author: new Form.Field({ key: 'author' })
    },
    schema: { legend: 'Main', fields: ['title', 'author'] }
  });

  same(fs.getFieldAt(0), fs.fields.title);
  same(fs.getFieldAt(1), fs.fields.author);
});



module('Fieldset#templateData');

test('returns schema', function() {
  var fs = new Fieldset({
    fields: {
      title: new Form.Field({ key: 'title' }),
      author: new Form.Field({ key: 'author' })
    },
    schema: { legend: 'Main', fields: ['title', 'author'] }
  });

  same(fs.templateData(), fs.schema);
});



module('Fieldset#render', {
  setup: function() {
    this.sinon = sinon.sandbox.create();

    this.sinon.stub(Form.Field.prototype, 'render', function() {
      this.setElement($('<field class="'+this.key+'" />'));
      return this;
    });
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('returns self', function() {
  var fs = new Fieldset({
    fields: {
      title: new Form.Field({ key: 'title' }),
      author: new Form.Field({ key: 'author' })
    },
    schema: { legend: 'Main', fields: ['title', 'author'] }
  });

  var returnedValue = fs.render();

  same(returnedValue, fs);
});

test('with data-fields placeholder, on inner element', function() {
  var fs = new Fieldset({
    fields: {
      title: new Form.Field({ key: 'title' }),
      author: new Form.Field({ key: 'author' })
    },
    schema: { legend: 'Main', fields: ['title', 'author'] },
    template: _.template('<div><%= legend %><b data-fields></b></div>')
  });

  fs.render();

  same(fs.$el.html(), 'Main<b data-fields=""><field class="title"></field><field class="author"></field></b>');
});

test('with data-fields placeholder, on outermost element', function() {
  var fs = new Fieldset({
    fields: {
      title: new Form.Field({ key: 'title' }),
      author: new Form.Field({ key: 'author' })
    },
    schema: { legend: 'Main', fields: ['title', 'author'] },
    template: _.template('<b data-fields><%= legend %></b>')
  });

  fs.render();

  same(fs.$el.html(), 'Main<field class="title"></field><field class="author"></field>');
});



module('Form#remove', {
  setup: function() {
    this.sinon = sinon.sandbox.create();

    this.sinon.spy(Form.Field.prototype, 'remove');
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('removes fieldsets, fields and self', function() {  
  var fs = new Fieldset({
    fields: {
      title: new Form.Field({ key: 'title' }),
      author: new Form.Field({ key: 'author' })
    },
    schema: { legend: 'Main', fields: ['title', 'author'] }
  });
  
  fs.remove();

  same(Form.Field.prototype.remove.callCount, 2);
});

})(Backbone.Form, Backbone.Form.Fieldset);
