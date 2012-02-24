module('Field');

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

test("'schema.help' option - Specifies help text", function() {
  var field = new Field({
    key: 'title',
    schema: { help: 'Some new help text' }
  }).render();
  
  equal($('.bbf-help', field.el).html(), 'Some new help text');
});

test("'model' option - Populates the field with the given 'key' option from the model", function() {
    var field = new Field({
        model: new Post,
        key: 'title'
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



test("commit() - Updates the given model with the new value", function() {
    var post = new Post({ title: 'Initial Title' });
    
    var field = new Field({
        model: post,
        key: 'title'
    }).render();
    
    //Change field value
    $('#title', field.el).val('New Title');
    
    field.commit();
    
    equal(post.get('title'), 'New Title');
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

test('validate() - sets field error class name', function() {
  var errorClass = Form.classNames.error;

  var field = new Field({
    key: 'title',
    schema: { validators: ['required'] }
  }).render();
  
  //Has error class when invalid
  field.setValue(null);
  ok(field.validate());
  ok($(field.el).hasClass(errorClass));
  
  //Doesn't have error class when valid
  field.setValue('Title');
  equal(field.validate(), undefined);
  equal($(field.el).hasClass(errorClass), false);
});

test('validate() - sets error message on help field', function() {
  var field = new Field({
    key: 'title',
    schema: { validators: ['required'] }
  }).render();
  
  //Trigger error message
  field.setValue(null);
  field.validate();
  
  //Test
  equal(field.$help.html(), 'Required');
});

test('validate() - resets help message when error has been fixed', function() {
  var field = new Field({
    key: 'email',
    schema: { validators: ['email'], help: 'Help message' }
  }).render();
  
  //Trigger error message
  field.setValue('invalid');
  field.validate();
  
  //Clear error message
  field.setValue('email@example.com');
  field.validate();
  
  //Test
  equal(field.$help.html(), 'Help message');
});
