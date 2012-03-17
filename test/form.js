module("Form");

test("'schema' option - Schema object is used to create the form", function() {
    var post = new Post(),
        customSchema = { name: {} };

    var form = new Form({
        model: post,
        schema: customSchema,
        idPrefix: null
    }).render();

    //Check correct fields have been added
    equal($('input', form.el).length, 1);
    equal($('input:eq(0)', form.el).attr('id'), 'name');
});

test("'schema' option - If not present, the 'schema' attribute on the model is used", function() {
    var post = new Post();

    var form = new Form({
        model: post
    }).render();

    //Stored correct schema object
    equal(form.schema, post.schema);

    //Check correct fields have been added
    equal($('input', form.el).length, 3);
    equal($('textarea', form.el).length, 1);
});

test('The schema on the model can be a function', function() {
  var post = new Post,
      _schema = post.schema;
  
  post.schema = function() {
    return _schema;
  }
  
  var form = new Form({
    model: post
  }).render();
  
  

  //Stored correct schema object
  equal(form.schema, _schema);
});

test("'model' option - Populates the form", function() {
    var post = new Post();

    var form = new Form({
        model: post,
        idPrefix: null
    }).render();

    equal($('#title', form.el).val(), 'Danger Zone!');
    equal($('#author', form.el).val(), 'Sterling Archer');
});

test("'data' option - Used if no model provided. Populates the form.", function() {
    var data = {
        title: 'Yuuup', 
        author: 'Lana Kang'
    };

    var form = new Form({
        data: data,
        schema: {
            title: {},
            author: {}
        }
    }).render();

    equal($('#title', form.el).val(), 'Yuuup');
    equal($('#author', form.el).val(), 'Lana Kang');
});

test("'fields' option - Allows choosing and ordering fields from the schema", function() {
    var form = new Form({
        model: new Post,
        fields: ['author', 'slug'],
        idPrefix: null
    }).render();

    equal($('input:eq(0)', form.el).attr('id'), 'author');
    equal($('input:eq(1)', form.el).attr('id'), 'slug');
});

test("'fieldsets' option - Allows choosing and ordering of fields within fieldsets", function () {
    var form = new Form({
        model: new Post,
        fieldsets: [
            ['slug', 'author'],
            {'legend': 'Content Section', 'fields': ['title', 'content']}
        ],
        idPrefix: null
    }).render();

    ok(form.$(':nth-child(1)').is('fieldset'), 'First element of the form is not a fieldset');
    equal(form.$('fieldset:nth-child(1) input:eq(0)').attr('id'), 'slug');
    equal(form.$('fieldset:nth-child(1) input:eq(1)').attr('id'), 'author');
    equal(form.$('fieldset:nth-child(2) legend').html(), 'Content Section');
    equal(form.$('fieldset:nth-child(2) input:eq(0)').attr('id'), 'title');
    equal(form.$('fieldset:nth-child(2) textarea').attr('id'), 'content');
});

test("'idPrefix' option - Adds prefix to all DOM element IDs", function() {
    var form = new Form({
        model: new Post,
        idPrefix: 'form_'
    }).render();

    equal($('#form_title', form.el).length, 1);
});

test("'template' option - Specifies template", function() {
  Form.templates.customForm = Form.helpers.createTemplate('<div class="custom-form"><form>{{fieldsets}}</form></div>');
  
  var form = new Form({
    model: new Post,
    template: 'customForm'
  }).render();
  
  ok(form.$el.hasClass('custom-form'));
})


test("validate() - validates the form and returns an errors object", function () {
  var form = new Form({
    schema: {
      title: {validators: ['required']}
    }
  }).render();
  
  var err = form.validate();

  equal(err.title.type, 'required');
  equal(err.title.message, 'Required');

  form.setValue({title: 'A valid title'});
  equal(form.validate(), null);
});

test('validate() - returns model validation errors', function() {
  var post = new Post;
  
  post.validate = function() {
    return 'FOO';
  };
  
  var form = new Form({
    model: post,
    schema: {
      title: {validators: ['required']}
    }
  }).render();
  
  var err = form.validate();
  
  deepEqual(err, {
    _others: ['FOO']
  });
});

test('commit() - returns validation errors', function() {
  var form = new Form({
      model: new Post
  }).render();
  
  //Mock
  form.validate = function() {
    return { foo: 'bar' }
  };
  
  var err = form.commit();
  
  equal(err.foo, 'bar');
});

test('commit() - returns model validation errors', function() {
  var post = new Post;
  
  post.validate = function() {
    return 'ERROR';
  };
  
  var form = new Form({
      model: post
  }).render();
  
  var err = form.commit();
  
  deepEqual(err, {
    _others: ['ERROR']
  });
});

test("commit() - updates the model with form values", function() {
    var post = new Post();

    var form = new Form({
        model: post,
        idPrefix: null
    }).render();

    //Change the title in the form and save
    $('#title', form.el).val('New title');        
    form.commit();

    equal(post.get('title'), 'New title');
});

test('commit() - triggers model change once', function() {
  var post = new Post;

  var form = new Form({
      model: post
  }).render();
  
  //Count change events
  var timesCalled = 0;
  post.on('change', function() {
    timesCalled ++;
  });
  
  form.fields.title.setValue('New title');
  form.fields.author.setValue('New author');
  form.commit();
  
  equal(timesCalled, 1);
});

test("getValue() - returns form value as an object", function() {
    var data = {
        title: 'Yuuup', 
        author: 'Lana Kang'
    };

    var form = new Form({
        data: data,
        schema: {
            title: {},
            author: {}
        }
    }).render();

    //Change the title in the form and save
    $('#title', form.el).val('Nooope');
    
    var result = form.getValue();
    
    equal(result.title, 'Nooope');
    equal(result.author, 'Lana Kang');
});

test("getValue(key) - returns specific field value", function() {
    var form = new Form({
        model: new Post
    }).render();
    
    equal(form.getValue('title'), 'Danger Zone!');
});

test("setValue() - updates form field values", function() {
    var form = new Form({
        model: new Post
    }).render();
    
    form.setValue({
        title: 'Danger Zone 2',
        slug: 'danger-zone-2'
    });
    
    //Check changed fields
    equal(form.fields.title.getValue(), 'Danger Zone 2');
    equal(form.fields.slug.getValue(), 'danger-zone-2');
    
    //Check fields that shouldn't have changed
    equal(form.fields.author.getValue(), 'Sterling Archer');
});

test("remove() - removes all child views and itself", function() {
    var counter = 0;
    
    //Mock out the remove method so we can tell how many times it was called
    var _remove = Backbone.View.prototype.remove;
    Backbone.View.prototype.remove = function() {
        counter++;
    }
    
    var form = new Form({
        model: new Post,
        fields: ['author', 'title', 'content', 'slug']
    }).render();
    
    form.remove();
    
    //remove() should have been called twice for each field (editor and field)
    //and once for the form itself
    equal(counter, 9);
    
    //Restore remove method
    Backbone.View.prototype.remove = _remove;
});

test('Allows access to field views', function() {
    var form = new Form({
        model: new Post
    }).render();
    
    ok(form.fields.title instanceof Form.Field);
    ok(form.fields.author instanceof Form.Field);
});

test("Supports picking nested fields from within Objects", function() {
    var Model = Backbone.Model.extend({
        schema: {
            title: {},
            author: { type: 'Object', subSchema: {
                id: { type: 'Number' },
                name: { type: 'Object', subSchema: {
                    first: {},
                    last: {}
                }}
            }}
        }
    });
    
    var form = new Form({
        model: new Model,
        fields: ['title', 'author.id', 'author.name.last']
    }).render();
    
    deepEqual(_.keys(form.fields), ['title', 'author.id', 'author.name.last']);
    
    ok(form.fields['title'].editor instanceof Form.editors.Text);
    ok(form.fields['author.id'].editor instanceof Form.editors.Number);
    ok(form.fields['author.name.last'].editor instanceof Form.editors.Text);
});
