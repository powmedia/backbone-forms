var same = deepEqual;

(function() {
  module('Base');
  
  test('initialize() - sets the "name" attribute on the element, if key is available', function() {
    var editor = new editors.Text({
      model: new Post,
      key: 'title'
    }).render();
    
    equal($(editor.el).attr('name'), 'title')
  })
  
  test("'schema.editorClass' option - Adds class names to editor", function() {
    var editor = new editors.Text({
      key: 'title',
      schema: { editorClass: 'foo bar' }
    }).render();

    var $el = editor.$el;
    
    ok($el.hasClass('foo'), 'Adds first defined class');
    ok($el.hasClass('bar'), 'Adds other defined class');
  })
  
  test("'schema.editorAttrs' option - Adds custom attributes", function() {
    var editor = new editors.Text({
      key: 'title',
      schema: {
        editorAttrs: {
          maxlength: 30,
          type: 'foo',
          custom: 'hello'
        }
      }
    }).render();

    var $el = editor.$el;

    equal($el.attr('maxlength'), 30);
    equal($el.attr('type'), 'foo');
    equal($el.attr('custom'), 'hello');
  })
  
  test('commit() - returns validation errors', function() {
    var editor = new editors.Text({
      model: new Post,
      key: 'title',
      validators: ['required']
    }).render();
    
    editor.setValue(null);
    
    var err = editor.commit();
    
    equal(err.type, 'required');
    equal(err.message, 'Required');
  });

  test('commit() - sets value to model', function() {
    var post = new Post;

    var editor = new editors.Text({
      model: post,
      key: 'title'
    }).render();

    //Change value
    editor.setValue('New Title');

    editor.commit();

    equal(post.get('title'), 'New Title');
  });
  
  test('commit() - returns model validation errors', function() {
    var post = new Post;
    
    post.validate = function() {
      return 'ERROR';
    };

    var editor = new editors.Text({
      model: post,
      key: 'title'
    }).render();
    
    var err = editor.commit();
    
    equal(err, 'ERROR');
  });
  
  test('validate() - returns validation errors', function() {
    var editor = new editors.Text({
      key: 'title',
      validators: ['required']
    });

    ok(editor.validate());

    editor.setValue('a value');

    ok(_(editor.validate()).isUndefined());
  });

  test('getName() - replaces periods with underscores', function() {
    var editor = new editors.Base();
    editor.key = 'user.name.first';

    equal(editor.getName(), 'user_name_first');
  });
})();


module('Text');

(function() {
    
    var editor = editors.Text;
    
    test('getValue() - Default value', function() {
        var field = new editor().render();

        equal(field.getValue(), '');
    });

    test('getValue() - Custom value', function() {
        var field = new editor({
            value: 'Test'
        }).render();

        equal(field.getValue(), 'Test');
    });

    test('getValue() - Value from model', function() {
        var field = new editor({
            model: new Post,
            key: 'title'
        }).render();
        
        equal(field.getValue(), 'Danger Zone!');
    });
    
    test("setValue() - updates the input value", function() {
        var field = new editor({
            model: new Post,
            key: 'title'
        }).render();
        
        field.setValue('foobar');
        
        equal(field.getValue(), 'foobar');
        equal($(field.el).val(), 'foobar');
    });

    test('Default type is text', function() {
        var field = new editor().render();

        equal($(field.el).attr('type'), 'text');
    });
    
    test('Type can be changed', function() {
        var field = new editor({
            schema: { dataType: 'tel' }
        }).render();
        
        equal($(field.el).attr('type'), 'tel');
    });

})();




module('Number');

(function() {
    
    var editor = editors.Number;
    
    test('Default value', function() {
        var field = new editor().render();

        deepEqual(field.getValue(), 0);
    });

    test('Null value', function() {
        var field = new editor().render();
        field.setValue(null);

        deepEqual(field.getValue(), null);
    });

    test('Custom value', function() {
        var field = new editor({
            value: 100
        }).render();

        deepEqual(field.getValue(), 100);
    });

    test('Value from model', function() {
        var field = new editor({
            model: new Post({ title: 99 }),
            key: 'title'
        }).render();
        
        deepEqual(field.getValue(), 99);
    });

    test('Sets input type to "number"', function() {
        var field = new editor({
            value: 123
        }).render();

        deepEqual(field.$el.attr('type'), 'number');
    });
    
    test("TODO: Restricts non-numeric characters", function() {

    });

    test("setValue() - updates the input value", function() {
        var field = new editor({
            model: new Post,
            key: 'title'
        }).render();

        field.setValue('2.4');

        deepEqual(field.getValue(), 2.4);
        equal($(field.el).val(), 2.4);
    });

    test('setValue() - handles different types', function() {
        var field = new editor().render();

        field.setValue('123');
        same(field.getValue(), 123);

        field.setValue('123.78');
        same(field.getValue(), 123.78);

        field.setValue(undefined);
        same(field.getValue(), null);

        field.setValue('');
        same(field.getValue(), null);

        field.setValue(' ');
        same(field.getValue(), null);

        //For Firefox
        field.setValue('heuo46fuek');
        same(field.getValue(), null);
    });

})();




module('Password');

(function() {
    
    var editor = editors.Password;
    
    test('Default value', function() {
        var field = new editor().render();

        equal(field.getValue(), '');
    });

    test('Custom value', function() {
        var field = new editor({
            value: 'Test'
        }).render();

        equal(field.getValue(), 'Test');
    });

    test('Value from model', function() {
        var field = new editor({
            model: new Post,
            key: 'title'
        }).render();
        
        equal(field.getValue(), 'Danger Zone!');
    });
    
    test('Correct type', function() {
        var field = new editor().render();
        
        equal($(field.el).attr('type'), 'password');
    });
    
    test("setValue() - updates the input value", function() {
        var field = new editor({
            model: new Post,
            key: 'title'
        }).render();
        
        field.setValue('foobar');
        
        equal(field.getValue(), 'foobar');
        equal($(field.el).val(), 'foobar');
    });

})();




module('TextArea');

(function() {
    
    var editor = editors.TextArea;
    
    test('Default value', function() {
        var field = new editor().render();

        equal(field.getValue(), '');
    });

    test('Custom value', function() {
        var field = new editor({
            value: 'Test'
        }).render();

        equal(field.getValue(), 'Test');
    });

    test('Value from model', function() {
        var field = new editor({
            model: new Post,
            key: 'title'
        }).render();
        
        equal(field.getValue(), 'Danger Zone!');
    });
    
    test('Correct type', function() {
        var field = new editor().render();
        
        equal($(field.el).get(0).tagName, 'TEXTAREA');
    });
    
    test("setValue() - updates the input value", function() {
        var field = new editor({
            model: new Post,
            key: 'title'
        }).render();
        
        field.setValue('foobar');
        
        equal(field.getValue(), 'foobar');
        equal($(field.el).val(), 'foobar');
    });

})();



module('checkbox');

(function() {
    
    var editor = editors.Checkbox;
    
    var Model = Backbone.Model.extend({
        schema: {
            enabled: { type: 'Checkbox' }
        }
    });
    
    test('Default value', function() {
        var field = new editor().render();

        deepEqual(field.getValue(), false);
    });

    test('Custom value', function() {
        var field = new editor({
            value: true
        }).render();

        deepEqual(field.getValue(), true);
    });

    test('Value from model', function() {
        var field = new editor({
            model: new Model({ enabled: true }),
            key: 'enabled'
        }).render();
        
        deepEqual(field.getValue(), true);
    });
    
    test('Correct type', function() {
        var field = new editor().render();
        
        deepEqual($(field.el).get(0).tagName, 'INPUT');
        deepEqual($(field.el).attr('type'), 'checkbox');
    });
    
    test("getValue() - returns boolean", function() {
        var field1 = new editor({
            value: true
        }).render();
        
        var field2 = new editor({
            value: false
        }).render();
        
        deepEqual(field1.getValue(), true);
        deepEqual(field2.getValue(), false);
    });
    
    test("setValue() - updates the input value", function() {
        var field = new editor({
            model: new Model,
            key: 'enabled'
        }).render();
        
        field.setValue(true);
        
        deepEqual(field.getValue(), true);
        deepEqual($(field.el).attr('checked'), 'checked');
    });
    
})();



module('Hidden');

(function() {

    var editor = editors.Hidden;

    test('Default value', function() {
        var field = new editor().render();

        equal(field.getValue(), '');
    });

    test('Custom value', function() {
        var field = new editor({
            value: 'Test'
        }).render();

        equal(field.getValue(), 'Test');
    });

    test('Value from model', function() {
        var field = new editor({
            model: new Post,
            key: 'title'
        }).render();

        equal(field.getValue(), 'Danger Zone!');
    });

    test('Correct type', function() {
        var field = new editor().render();

        equal($(field.el).attr('type'), 'hidden');
    });

    test("setValue() - updates the field value", function() {
        var field = new editor({
            model: new Post,
            key: 'title'
        }).render();

        field.setValue('foobar');

        equal(field.getValue(), 'foobar');
    });

})();




module('Select');

(function() {
    
    var editor = editors.Select,
        schema = {
            options: ['Sterling', 'Lana', 'Cyril', 'Cheryl', 'Pam']
        };
    
    test('Default value', function() {
        var field = new editor({
            schema: schema
        }).render();

        equal(field.getValue(), 'Sterling');
    });

    test('Custom value', function() {
        var field = new editor({
            value: 'Cyril',
            schema: schema
        }).render();

        equal(field.getValue(), 'Cyril');
    });

    test('Value from model', function() {
        var field = new editor({
            model: new Backbone.Model({ name: 'Lana' }),
            key: 'name',
            schema: schema
        }).render();
        
        equal(field.getValue(), 'Lana');
    });
    
    test('Correct type', function() {
        var field = new editor({
            schema: schema
        }).render();
        
        equal($(field.el).get(0).tagName, 'SELECT');
    });
    
    test('TODO: Options as array of items', function() {

    });
    
    test('TODO: Options as array of objects', function() {

    });

    test('TODO: Options as function that calls back with options', function() {

    });

    test('TODO: Options as string of HTML', function() {

    });

    test('TODO: Options as a pre-populated collection', function() {

    });
    
    test('TODO: Options as a new collection (needs to be fetched)', function() {

    });
    
    test("setValue() - updates the input value", function() {
        var field = new editor({
            value: 'Pam',
            schema: schema
        }).render();
        
        field.setValue('Lana');
        
        equal(field.getValue(), 'Lana');
        equal($(field.el).val(), 'Lana');
    });

})();




module('Radio');

(function() {
    var editor = editors.Radio,
        schema = {
            options: ['Sterling', 'Lana', 'Cyril', 'Cheryl', 'Pam']
        };

    test('Default value', function() {
        var field = new editor({
            schema: schema
        }).render();

        equal(field.getValue(), undefined);
    });

    test('Custom value', function() {
        var field = new editor({
            value: 'Cyril',
            schema: schema
        }).render();

        equal(field.getValue(), 'Cyril');
    });

    test('Throws errors if no options', function () {
        raises(function () {
            var field = new editor({schema: {}});
        }, /^Missing required/, 'ERROR: Accepted a new Radio editor with no options.');
    });

    test('Value from model', function() {
        var field = new editor({
            model: new Backbone.Model({ name: 'Lana' }),
            key: 'name',
            schema: schema
        }).render();
        equal(field.getValue(), 'Lana');
    });

    test('Correct type', function() {
        var field = new editor({
            schema: schema
        }).render();
        equal($(field.el).get(0).tagName, 'UL');
        notEqual($(field.el).find('input[type=radio]').length, 0);
    });

})();


module('Checkboxes');

(function() {
    var editor = editors.Checkboxes,
        schema = {
            options: ['Sterling', 'Lana', 'Cyril', 'Cheryl', 'Pam', 'Doctor Krieger']
        };

    test('Default value', function() {
        var field = new editor({
            schema: schema
        }).render();

        var value = field.getValue();
        equal(_.isEqual(value, []), true);
    });

    test('Custom value', function() {
        var field = new editor({
            value: ['Cyril'],
            schema: schema
        }).render();

        var value = field.getValue();
        var expected = ['Cyril'];
        equal(_.isEqual(expected, value), true);
    });

    test('Throws errors if no options', function () {
        raises(function () {
            var field = new editor({schema: {}});
        }, /^Missing required/, 'ERROR: Accepted a new Checkboxes editor with no options.');
    });

    // Value from model doesn't work here as the value must be an array.

    test('Correct type', function() {
        var field = new editor({
            schema: schema
        }).render();
        equal($(field.el).get(0).tagName, 'UL');
        notEqual($(field.el).find('input[type=checkbox]').length, 0);
    });

    test('setting value with one item', function() {
        var field = new editor({
            schema: schema
        }).render();

        field.setValue(['Lana']);
        
        deepEqual(field.getValue(), ['Lana']);
        equal($(field.el).find('input[type=checkbox]:checked').length, 1);
    });

    test('setting value with multiple items, including a value with a space', function() {
        var field = new editor({
            schema: schema
        }).render();

        field.setValue(['Lana', 'Doctor Krieger']);
        
        deepEqual(field.getValue(), ['Lana', 'Doctor Krieger']);
        equal($(field.el).find('input[type=checkbox]:checked').length, 2);
    });

})();




module('Object');

(function() {
    
    var editor = editors.Object,
        schema = {
            subSchema: {
                id: { type: 'Number' },
                name: { }
            }
        };
    
    test('Default value', function() {
        var field = new editor({
            schema: schema
        }).render();
        
        deepEqual(field.getValue(), { id: 0, name: '' });
    });

    test('Custom value', function() {
        var field = new editor({
            schema: schema,
            value: {
                id: 42,
                name: "Krieger"
            }
        }).render();

        deepEqual(field.getValue(), { id: 42, name: "Krieger" });
    });

    test('Value from model', function() {
        var agency = new Backbone.Model({
            spy: {
                id: 28,
                name: 'Pam'
            }
        });
        
        var field = new editor({
            schema: schema,
            model: agency,
            key: 'spy'
        }).render();
        
        deepEqual(field.getValue(), { id: 28, name: 'Pam' });
    });
    
    test("TODO: idPrefix is added to child form elements", function() {
        
    });
    
    test("TODO: remove() - Removes embedded form", function() {
        
    });

    test('TODO: uses the nestedField template, unless overridden in field schema', function() {

    });
    
    test("setValue() - updates the input value", function() {
        var field = new editor({
            schema: schema,
            value: {
                id: 42,
                name: "Krieger"
            }
        }).render();
        
        var newValue = {
            id: 89,
            name: "Sterling"
        };
        
        field.setValue(newValue);
        
        deepEqual(field.getValue(), newValue);
    });
    
    test('validate() - returns validation errors', function() {
      var schema = {};
      schema.subSchema = {
        id:     { validators: ['required'] },
        name:   {},
        email:  { validators: ['email'] }
      }
      
      var field = new editor({
        schema: schema,
        value: {
          id: null,
          email: 'invalid'
        }
      }).render();
      
      var errs = field.validate();
      
      equal(errs.id.type, 'required');
      equal(errs.email.type, 'email');
    });

})();




module('NestedModel');

(function() {
    
    var ChildModel = Backbone.Model.extend({
        schema: {
            id: { type: 'Number' },
            name: {}
        }
    });
    
    var editor = editors.NestedModel,
        schema = { model: ChildModel };
    
    test('Default value', function() {
        /*
        var field = new editor({
            schema: schema
        }).render();
        
        deepEqual(field.getValue(), { id: 0, name: '' });
        */
    });

    test('Custom value', function() {
        var field = new editor({
            schema: schema,
            value: {
                id: 42,
                name: "Krieger"
            }
        }).render();

        deepEqual(field.getValue(), { id: 42, name: "Krieger" });
    });

    test('Value from model', function() {
        var agency = new Backbone.Model({
            spy: {
                id: 28,
                name: 'Pam'
            }
        });
        
        var field = new editor({
            schema: schema,
            model: agency,
            key: 'spy'
        }).render();
        
        deepEqual(field.getValue(), { id: 28, name: 'Pam' });
    });
    
    test("TODO: idPrefix is added to child form elements", function() {

    });
    
    test("TODO: Validation on nested model", function() {

    });

    test('TODO: uses the nestedField template, unless overridden in field schema', function() {

    });

    test("TODO: remove() - Removes embedded form", function() {

    });
    
    test("setValue() - updates the input value", function() {
        var agency = new Backbone.Model({
            spy: {
                id: 28,
                name: 'Pam'
            }
        });
        
        var field = new editor({
            schema: schema,
            model: agency,
            key: 'spy'
        }).render();
        
        var newValue = {
            id: 89,
            name: "Sterling"
        };
        
        field.setValue(newValue);
        
        deepEqual(field.getValue(), newValue);
    });

})();


module('List', {
    setup: function() {
        this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
        this.sinon.restore();
    }
});

(function() {
    var Editor = editors.SimpleList;

    test('Default settings', function() {
        var list = new Editor();

        same(list.schema.listType, 'Text');
    });

    test('Default value', function() {
        var list = new Editor().render();

        same(list.getValue(), []);
    });

    test('Custom value', function() {
        var list = new Editor({
            schema: { listType: 'Number' },
            value: [1,2,3]
        }).render();

        same(list.getValue(), [1,2,3]);
    });

    test('Value from model', function() {
        var list = new Editor({
            model: new Post,
            key: 'weapons'
        }).render();

        same(list.getValue(), ['uzi', '9mm', 'sniper rifle']);
    });

    test('setValue() - updates input value', function() {
        var list = new Editor().render();

        list.setValue(['a', 'b', 'c']);

        same(list.getValue(), ['a', 'b', 'c']);
    });

    test('validate() - returns validation errors', function() {
        var list = new Editor({
            schema: { validators: ['required', 'email'] },
            value: ['invalid', 'john@example.com', '', 'ok@example.com']
        }).render();

        var err = list.validate();

        same(err.type, 'list');
        same(err.errors[0].type, 'email');
        same(err.errors[1], null);
        same(err.errors[2].type, 'required');
        same(err.errors[3], null);
    });

    test('validate() - returns null if there are no errors', function() {
        var list = new Editor({
            schema: { validators: ['required', 'email'] },
            value: ['john@example.com', 'ok@example.com']
        }).render();

        var errs = list.validate();

        same(errs, null);
    });

    test('event: clicking something with data-action="add" adds an item', function() {
        var list = new Editor().render();

        same(list.items.length, 1);

        list.$el.find('[data-action="add"]').click();
        
        same(list.items.length, 2);
    });

    test('render() - sets the $list property to the template {{items}} tag', function() {
        //Backup original template
        var _template = Form.templates.simpleList;

        Form.setTemplates({
            simpleList: '<ul class="customList">{{items}}</div>'
        });

        var list = new Editor().render();

        ok(list.$list.hasClass('customList'));

        //Restore template
        Form.templates.simpleList = _template;
    });

    test('render() - creates items for each item in value array', function() {
        var list = new Editor({
            value: [1,2,3]
        });

        same(list.items.length, 0);

        list.render();

        same(list.items.length, 3);
    });

    test('render() - creates an initial empty item for empty array', function() {
        var list = new Editor({
            value: []
        });

        same(list.items.length, 0);

        list.render();

        same(list.items.length, 1);
    });

    test('addItem() - with no value', function() {
        var list = new Editor().render();

        var spy = this.sinon.spy(Editor, 'Item');

        list.addItem();

        var expectedOptions = {
            list: list,
            schema: list.schema,
            value: undefined
        }

        var actualOptions = spy.lastCall.args[0];

        same(spy.callCount, 1);
        same(actualOptions, expectedOptions);
        same(list.items.length, 2);
        same(_.last(list.items).value, undefined);
    });

    test('addItem() - with value', function() {
        var list = new Editor().render();

        var spy = this.sinon.spy(Editor, 'Item');

        list.addItem('foo');

        var expectedOptions = {
            list: list,
            schema: list.schema,
            value: 'foo'
        }

        var actualOptions = spy.lastCall.args[0];

        same(spy.callCount, 1);
        same(actualOptions, expectedOptions);
        same(list.items.length, 2);
        same(_.last(list.items).value, 'foo');
    });

    test('addItem() - adds the item to the DOM', function() {
        var list = new Editor().render();

        list.addItem('foo');

        var $el = list.$('li:last input');

        same($el.val(), 'foo');
    });

    test('removeItem() - removes passed item from view and item array', function() {
        var list = new Editor().render();

        list.addItem();

        same(list.items.length, 2);
        same(list.$('li').length, 2);

        var item = _.last(list.items);

        list.removeItem(item);

        same(list.items.length, 1);
        same(list.$('li').length, 1);
        same(_.indexOf(list.items, item), -1, 'Removed item is no longer in list.items');
    });

    test('removeItem() - adds an empty item if list is empty', function() {
        var list = new Editor().render();

        var spy = sinon.spy(list, 'addItem');

        list.removeItem(list.items[0]);

        same(spy.callCount, 1);
        same(list.items.length, 1);
    });

    test('removeItem() - can be configured to ask for confirmation - and is cancelled', function() {
        //Simulate clicking 'cancel' on confirm dialog
        var stub = this.sinon.stub(window, 'confirm', function() {
            return false;
        });

        var list = new Editor({
            schema: {
                confirmDelete: 'You sure about this?'
            }
        }).render();

        list.addItem();
        list.removeItem(_.last(list.items));

        //Check confirmation was shown
        same(stub.callCount, 1);

        //With custom message
        var confirmMsg = stub.lastCall.args[0];
        same(confirmMsg, 'You sure about this?')

        //And item was not removed
        same(list.items.length, 2, 'Did not remove item');
    });

    test('removeItem() - can be configured to ask for confirmation - and is confirmed', function() {
        //Simulate clicking 'ok' on confirm dialog
        var stub = this.sinon.stub(window, 'confirm', function() {
            return true;
        });

        var list = new Editor({
            schema: {
                confirmDelete: 'You sure about this?'
            }
        }).render();

        list.addItem();
        list.removeItem(_.last(list.items));

        //Check confirm was shown
        same(stub.callCount, 1);

        //And item was removed
        same(list.items.length, 1, 'Removed item');
    });
})();



module('List.Item', {
    setup: function() {
        this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
        this.sinon.restore();
    }
});

(function() {
    var List = editors.SimpleList;

    test('render() - creates the editor for the given listType', function() {
        var spy = this.sinon.spy(Form.helpers, 'createEditor');

        var list = new List({
            schema: { listType: 'Number' }
        }).render();

        var item = new List.Item({
            list: list,
            value: 123
        }).render();

        //Check created correct editor
        var editorType = spy.lastCall.args[0],
            editorOptions = spy.lastCall.args[1];

        same(editorType, 'Number');
        same(editorOptions, {
            key: '',
            schema: item.schema,
            value: 123
        });
    });

    test('render() - creates the main element entirely from template, with editor in {{editor}} tag location', function() {
        //Replace template
        var _template = Form.templates.simpleListItem;

        Form.setTemplates({
            simpleListItem: '<div class="outer"><div class="inner">{{editor}}</div></div>'
        })

        //Create item
        var item = new List.Item({ list: new List }).render();

        //Check there is no wrapper tag
        ok(item.$el.hasClass('outer'));

        //Check editor placed in correct location
        ok(item.editor.$el.parent().hasClass('inner'));

        //Restore template
        Form.templates.simpleListItem = _template;
    });

    test('getValue() - returns editor value', function() {
        var item = new List.Item({
            list: new List,
            value: 'foo'
        }).render();

        same(item.editor.getValue(), 'foo');
        same(item.getValue(), 'foo');
    });

    test('setValue() - sets editor value', function() {
        var item = new List.Item({ list: new List }).render();

        item.setValue('woo');

        same(item.editor.getValue(), 'woo');
        same(item.getValue(), 'woo');
    });

    test('remove() - removes the editor then itself', function() {
        var item = new List.Item({ list: new List }).render();

        var editorSpy = this.sinon.spy(item.editor, 'remove'),
            viewSpy = this.sinon.spy(Backbone.View.prototype.remove, 'call');

        item.remove();

        //Check removed editor
        ok(editorSpy.calledOnce, 'Called editor remove');

        //Check removed main item
        ok(viewSpy.calledWith(item), 'Called parent view remove');
    });

    test('validate() - invalid - calls showError and returns error', function() {
        var item = new List.Item({
            list: new List({
                schema: { validators: ['required', 'email'] }
            }),
            value: 'invalid'
        }).render();

        var spy = this.sinon.spy(item, 'showError');

        var err = item.validate();

        same(err.type, 'email');
        same(spy.callCount, 1, 'Called showError');
        same(spy.lastCall.args[0], err, 'Called with error');
    });

    test('validate() - valid - calls hideError and returns null', function() {
        var item = new List.Item({
            list: new List({
                schema: { validators: ['required', 'email'] }
            }),
            value: 'valid@example.com'
        }).render();

        var spy = this.sinon.spy(item, 'hideError');

        var err = item.validate();

        same(err, null);
        same(spy.callCount, 1, 'Called hideError');
    });

    test('showError()', function() {
        var item = new List.Item({ list: new List }).render();

        item.showError({ type: 'errType', message: 'ErrMessage' });

        ok(item.$el.hasClass(Form.classNames.error), 'Element has error class');
        same(item.$el.attr('title'), 'ErrMessage');
    });

    test('hideError()', function() {
        var item = new List.Item({ list: new List }).render();

        item.showError({ type: 'errType', message: 'ErrMessage' });

        item.hideError();

        same(item.$el.hasClass(Form.classNames.error), false, 'Error class is removed from element');
        same(item.$el.attr('title'), undefined);
    });
})();



module('Date', {
    setup: function() {
        this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
        this.sinon.restore();
    }
});

(function() {
    var Editor = editors.SimpleDate;

    test('initialize() - casts values to date', function() {
        var date = new Date(2000, 0, 1);

        var editor = new Editor({ value: date.toString() });

        same(editor.value.constructor.name, 'Date');
        same(editor.value.getTime(), date.getTime());
    });

    test('initialize() - default value - today', function() {
        var editor = new Editor;

        var today = new Date,
            value = editor.value;

        same(value.getFullYear(), today.getFullYear());
        same(value.getMonth(), today.getMonth());
        same(value.getDate(), today.getDate());
    });

    test('initialize() - default options and schema', function() {
        var editor = new Editor();

        var schema = editor.schema,
            options = editor.options;

        //Schema options
        var today = new Date;
        same(schema.yearStart, today.getFullYear() - 100);
        same(schema.yearEnd, today.getFullYear());

        //Options should default to those stored on the static class
        same(editor.options.showMonthNames, Editor.showMonthNames);
        same(editor.options.monthNames, Editor.monthNames);
    });

    test('render()', function() {
        var date = new Date,
            editor = new Editor({ value: date }),
            spy = this.sinon.spy(editor, 'setValue');

        editor.render();

        //Test DOM elements
        same(editor.$date.attr('data-type'), 'date');
        same(editor.$date.find('option:first').val(), '1');
        same(editor.$date.find('option:last').val(), '31');
        same(editor.$date.find('option:first').html(), '1');
        same(editor.$date.find('option:last').html(), '31');

        same(editor.$month.attr('data-type'), 'month');
        same(editor.$month.find('option:first').val(), '0');
        same(editor.$month.find('option:last').val(), '11');
        same(editor.$month.find('option:first').html(), 'January');
        same(editor.$month.find('option:last').html(), 'December');

        same(editor.$year.attr('data-type'), 'year');
        same(editor.$year.find('option:first').val(), editor.schema.yearStart.toString());
        same(editor.$year.find('option:last').val(), editor.schema.yearEnd.toString());
        same(editor.$year.find('option:first').html(), editor.schema.yearStart.toString());
        same(editor.$year.find('option:last').html(), editor.schema.yearEnd.toString());

        ok(spy.calledWith(date), 'Called setValue');
    });

    test('render() - with showMonthNames false', function() {
        var editor = new Editor({
            showMonthNames: false
        }).render();

        same(editor.$month.attr('data-type'), 'month');
        same(editor.$month.find('option:first').html(), '1');
        same(editor.$month.find('option:last').html(), '12');
    });

    test('getValue() - returns a Date', function() {
        var date = new Date(2010, 5, 5),
            editor = new Editor({ value: date }).render();

        var value = editor.getValue();

        same(value.constructor.name, 'Date');
        same(value.getTime(), date.getTime());
    });

    test('setValue()', function() {
        var date = new Date(2015, 1, 4);
        
        var editor = new Editor({
            schema: {
                yearStart: 2000,
                yearEnd: 2020
            }
        }).render();

        editor.setValue(date);

        same(editor.$date.val(), '4');
        same(editor.$month.val(), '1');
        same(editor.$year.val(), '2015');

        same(editor.getValue().getTime(), date.getTime());
    });
})();



module('DateTime', {
    setup: function() {
        this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
        this.sinon.restore();
    }
});

(function() {
    var DateEditor = editors.SimpleDate,
        Editor = editors.SimpleDateTime;

    test('initialize() - default value - now (to the hour)', function() {
        var editor = new Editor;

        var now = new Date,
            value = editor.value;

        same(value.getFullYear(), now.getFullYear());
        same(value.getMonth(), now.getMonth());
        same(value.getDate(), now.getDate());
        same(value.getHours(), now.getHours());
        same(value.getMinutes(), now.getMinutes());
    });

    test('initialize() - default options and schema', function() {
        var editor = new Editor();

        var schema = editor.schema,
            options = editor.options;

        //Options should default to those stored on the static class
        same(editor.options.DateEditor, Editor.DateEditor);

        //Schema options
        same(schema.minsInterval, 15);
    });

    test('initialize() - creates a Date instance', function() {
        var spy = this.sinon.spy(Editor, 'DateEditor');

        var options = {},
            editor = new Editor(options);

        ok(editor.dateEditor instanceof Editor.DateEditor, 'Created instance of date editor');
        same(spy.lastCall.args[0], options);
    });

    test('render() - calls setValue', function() {
        var date = new Date,
            editor = new Editor({ value: date }),
            spy = this.sinon.spy(editor, 'setValue');

        editor.render();

        ok(spy.calledWith(date), 'Called setValue');
    });

    test('render() - creates hours and mins', function() {
        var editor = new Editor().render();

        //Test DOM elements
        same(editor.$hour.attr('data-type'), 'hour');
        same(editor.$hour.find('option').length, 24);
        same(editor.$hour.find('option:first').val(), '0');
        same(editor.$hour.find('option:last').val(), '23');
        same(editor.$hour.find('option:first').html(), '00');
        same(editor.$hour.find('option:last').html(), '23');

        same(editor.$min.attr('data-type'), 'min');
        same(editor.$min.find('option').length, 4);
        same(editor.$min.find('option:first').val(), '0');
        same(editor.$min.find('option:last').val(), '45');
        same(editor.$min.find('option:first').html(), '00');
        same(editor.$min.find('option:last').html(), '45');
    });

    test('render() - creates hours and mins - with custom minsInterval', function() {
        var editor = new Editor({
            schema: { minsInterval: 1 }
        }).render();

        same(editor.$min.attr('data-type'), 'min');
        same(editor.$min.find('option').length, 60);
        same(editor.$min.find('option:first').val(), '0');
        same(editor.$min.find('option:last').val(), '59');
        same(editor.$min.find('option:first').html(), '00');
        same(editor.$min.find('option:last').html(), '59');
    });

    test('render() - adds date editor in {{date}} template tag', function() {
        //Replace template
        var _template = Form.templates.dateTime;

        Form.setTemplates({
            dateTime: '<div class="foo">{{date}}</div>'
        });

        //Create item
        var editor = new Editor().render();

        //Check editor placed in correct location
        ok(editor.dateEditor.$el.parent().hasClass('foo'), 'Date el placed correctly');

        //Restore template
        Form.templates.dateTime = _template;
    });

    test('getValue() - returns a Date', function() {
        var date = new Date(2010, 5, 5, 14, 30),
            editor = new Editor({ value: date }).render();

        var value = editor.getValue();

        same(value.constructor.name, 'Date');
        same(value.getTime(), date.getTime());
    });

    test('setValue()', function() {
        var editor = new Editor().render();

        var spy = this.sinon.spy(editor.dateEditor, 'setValue');
        
        var date = new Date(2005, 1, 4, 19, 45);
        
        editor.setValue(date);

        //Should set value on date editor
        same(spy.lastCall.args[0], date);

        same(editor.getValue().getTime(), date.getTime());
    });
})();
