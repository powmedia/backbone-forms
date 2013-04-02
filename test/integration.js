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
