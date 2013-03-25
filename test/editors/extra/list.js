;(function(Form, Field, editors) {

module('List', {
    setup: function() {
        this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
        this.sinon.restore();
    }
});

var same = deepEqual;

(function() {
    var Post = Backbone.Model.extend({
        defaults: {
            title: 'Danger Zone!',
            content: 'I love my turtleneck',
            author: 'Sterling Archer',
            slug: 'danger-zone',
            weapons: ['uzi', '9mm', 'sniper rifle']
        },
        
        schema: {
            title:      { type: 'Text' },
            content:    { type: 'TextArea' },
            author:     {},
            slug:       {},
            weapons:    'List'
        }
    });

    var List = editors.List;

    test('Default settings', function() {
        var list = new List();

        same(list.Editor, editors.Text);
    });

    test('Uses custom list editors if defined', function() {
        var list = new List({
            schema: { itemType: 'Object' }
        });

        same(list.Editor, editors.List.Object);
    });

    test('Uses regular editor if there is no list version', function() {
        var list = new List({
            schema: { itemType: 'Number' }
        });

        same(list.Editor, editors.Number);
    });

    test('Default value', function() {
        var list = new List().render();

        same(list.getValue(), []);
    });

    test('Custom value', function() {
        var list = new List({
            schema: { itemType: 'Number' },
            value: [1,2,3]
        }).render();

        same(list.getValue(), [1,2,3]);
    });

    test('Value from model', function() {
        var list = new List({
            model: new Post,
            key: 'weapons'
        }).render();

        same(list.getValue(), ['uzi', '9mm', 'sniper rifle']);
    });

    test('setValue() - updates input value', function() {
        var list = new List().render();

        list.setValue(['a', 'b', 'c']);

        same(list.getValue(), ['a', 'b', 'c']);
    });

    test('validate() - returns validation errors', function() {
        var list = new List({
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
        var list = new List({
            schema: { validators: ['required', 'email'] },
            value: ['john@example.com', 'ok@example.com']
        }).render();

        var errs = list.validate();

        same(errs, null);
    });

    test('event: clicking something with data-action="add" adds an item', function() {
        var list = new List().render();

        same(list.items.length, 1);

        list.$('[data-action="add"]').click();
        
        same(list.items.length, 2);
    });

    test('render() - sets the $list property to the data-items placeholder', function() {
        var list = new List({
            template: _.template('<ul class="customList" data-items></div>')
        }).render();

        ok(list.$list.hasClass('customList'));
    });

    test('render() - creates items for each item in value array', function() {
        var list = new List({
            value: [1,2,3]
        });

        same(list.items.length, 0);

        list.render();

        same(list.items.length, 3);
    });

    test('render() - creates an initial empty item for empty array', function() {
        var list = new List({
            value: []
        });

        same(list.items.length, 0);

        list.render();

        same(list.items.length, 1);
    });

    test('addItem() - with no value', function() {
        var form = new Form();

        var list = new List({
            form: form
        }).render();

        var spy = this.sinon.spy(List, 'Item');

        list.addItem();

        var expectedOptions = {
            form: form,
            list: list,
            schema: list.schema,
            value: undefined,
            Editor: editors.Text,
            key: list.key
        }

        var actualOptions = spy.lastCall.args[0];

        same(spy.callCount, 1);
        same(list.items.length, 2);
        same(_.last(list.items).value, undefined);

        //Test options
        same(actualOptions, expectedOptions);
    });

    test('addItem() - with value', function() {
        var form = new Form();
        
        var list = new List({
            form: form
        }).render();

        var spy = this.sinon.spy(List, 'Item');

        list.addItem('foo');

        var expectedOptions = {
            form: form,
            list: list,
            schema: list.schema,
            value: 'foo',
            Editor: editors.Text,
            key: list.key
        }

        var actualOptions = spy.lastCall.args[0];

        same(spy.callCount, 1);
        same(actualOptions, expectedOptions);
        same(list.items.length, 2);
        same(_.last(list.items).value, 'foo');
    });

    test('addItem() - adds the item to the DOM', function() {
        var list = new List().render();

        list.addItem('foo');

        var $el = list.$('[data-items] div:last input');

        same($el.val(), 'foo');
    });

    test('removeItem() - removes passed item from view and item array', function() {
        var list = new List().render();

        list.addItem();

        same(list.items.length, 2);
        same(list.$('[data-items] div').length, 2);

        var item = _.last(list.items);

        list.removeItem(item);

        same(list.items.length, 1);
        same(list.$('[data-items] div').length, 1);
        same(_.indexOf(list.items, item), -1, 'Removed item is no longer in list.items');
    });

    test('addItem() - sets editor focus if editor is not isAsync', function() {
        var list = new List().render();
        
        this.sinon.spy(list.Editor.prototype, 'focus');

        list.addItem();

        ok(list.Editor.prototype.focus.calledOnce);
    });

    test('removeItem() - adds an empty item if list is empty', function() {
        var list = new List().render();

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

        var list = new List({
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

        var list = new List({
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
    
    test("focus() - gives focus to editor and its first item's editor", function() {
        var field = new List({
            model: new Post,
            key: 'weapons'
        }).render();
        $(document.body).append(field.el);

        field.focus();

        ok(field.items[0].editor.hasFocus);
        ok(field.hasFocus);
        
        field.remove();
    });

    test("focus() - triggers the 'focus' event", function() {
        var field = new List({
            model: new Post,
            key: 'weapons'
        }).render();
        $(document.body).append(field.el);

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.focus();

        ok(spy.called);
        ok(spy.calledWith(field));

        field.remove();
    });

    test("blur() - removes focus from the editor and its first item's editor", function() {
        var field = new List({
            model: new Post,
            key: 'weapons'
        }).render();

        field.focus();

        field.blur();

        stop();
        setTimeout(function() {
          ok(!field.items[0].editor.hasFocus);
          ok(!field.hasFocus);

          start();
        }, 0);
    });

    test("blur() - triggers the 'blur' event", function() {
        var field = new List({
            model: new Post,
            key: 'weapons'
        }).render();
        $(document.body).append(field.el);

        field.focus();

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.blur();

        stop();
        setTimeout(function() {
          ok(spy.called);
          ok(spy.calledWith(field));

          start();
        }, 0);

        field.remove();
    });

    test("'change' event - bubbles up from item's editor", function() {
        var field = new List({
            model: new Post,
            key: 'weapons'
        }).render();

        var spy = this.sinon.spy();

        field.on('change', spy);

        field.items[0].editor.trigger('change', field.items[0].editor);

        ok(spy.called);
        ok(spy.calledWith(field));
    });
    
    test("'change' event - is triggered when an item is added", function() {
        var field = new List({
            model: new Post,
            key: 'weapons'
        }).render();

        var spy = this.sinon.spy();
        
        field.on('change', spy);

        var item = field.addItem(null, true);

        ok(spy.called);
        ok(spy.calledWith(field));
    });
    
    test("'change' event - is triggered when an item is removed", function() {
        var field = new List({
            model: new Post,
            key: 'weapons'
        }).render();

        var spy = this.sinon.spy();
        
        var item = field.items[0];

        field.on('change', spy);

        field.removeItem(item);

        ok(spy.called);
        ok(spy.calledWith(field));
    });

    test("'focus' event - bubbles up from item's editor when editor doesn't have focus", function() {
        var field = new List({
            model: new Post,
            key: 'weapons'
        }).render();
        $(document.body).append(field.el);

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.items[0].editor.focus();

        ok(spy.called);
        ok(spy.calledWith(field));

        field.remove();
    });

    test("'focus' event - doesn't bubble up from item's editor when editor already has focus", function() {
        var field = new List({
            model: new Post,
            key: 'weapons'
        }).render();

        field.focus();

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.items[0].editor.focus();

        ok(!spy.called);
    });

    test("'blur' event - bubbles up from item's editor when editor has focus and we're not focusing on another one of the editor's item's editors", function() {
        var field = new List({
            model: new Post,
            key: 'weapons'
        }).render();
        $(document.body).append(field.el);

        field.focus();

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.items[0].editor.blur();

        stop();
        setTimeout(function() {
            ok(spy.called);
            ok(spy.calledWith(field));

            start();
        }, 0);

        field.remove();
    });

    test("'blur' event - doesn't bubble up from item's editor when editor has focus and we're focusing on another one of the editor's item's editors", function() {
        var field = new List({
            model: new Post,
            key: 'weapons'
        }).render();

        field.focus();

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.items[0].editor.blur();
        field.items[1].editor.focus();

        stop();
        setTimeout(function() {
            ok(!spy.called);

            start();
        }, 0);
    });

    test("'blur' event - doesn't bubble up from item's editor when editor doesn't have focus", function() {
        var field = new List({
            model: new Post,
            key: 'weapons'
        }).render();

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.items[0].editor.blur();

        stop();
        setTimeout(function() {
            ok(!spy.called);

            start();
        }, 0);
    });
    
    test("'add' event - is triggered when an item is added", function() {
        var field = new List({
            model: new Post,
            key: 'weapons'
        }).render();

        var spy = this.sinon.spy();
        
        field.on('add', spy);

        var item = field.addItem(null, true);

        ok(spy.called);
        ok(spy.calledWith(field, item.editor));
    });
    
    test("'remove' event - is triggered when an item is removed", function() {
        var field = new List({
            model: new Post,
            key: 'weapons'
        }).render();

        var item = field.items[0];

        var spy = this.sinon.spy();

        field.on('remove', spy);

        field.removeItem(item);

        ok(spy.called);
        ok(spy.calledWith(field, item.editor));
    });

    test("Events bubbling up from item's editors", function() {
        var field = new List({
            model: new Post,
            key: 'weapons'
        }).render();

        var spy = this.sinon.spy();

        field.on('item:whatever', spy);

        field.items[0].editor.trigger('whatever', field.items[0].editor);

        ok(spy.called);
        ok(spy.calledWith(field, field.items[0].editor));
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
    var List = editors.List;

    test('render() - creates the editor for the given listType', function() {
        var spy = this.sinon.spy(editors, 'Number');

        var form = new Form();

        var list = new List({
            form: form,
            schema: { itemType: 'Number' }
        }).render();

        var item = new List.Item({
            form: form,
            list: list,
            value: 123,
            Editor: editors.Number
        }).render();

        //Check created correct editor
        var editorOptions = spy.lastCall.args[0];

        same(editorOptions, {
            form: form,
            key: '',
            schema: item.schema,
            value: 123,
            list: list,
            item: item,
            key: item.key
        });
    });

    test('render() - creates the main element entirely from template, with editor in data-editor placeholder', function() {
        //Create item
        var item = new List.Item({
            template: _.template('<div class="outer"><div class="inner" data-editor></div></div>'),
            list: new List
        }).render();

        //Check there is no wrapper tag
        ok(item.$el.hasClass('outer'));

        //Check editor placed in correct location
        ok(item.editor.$el.parent().hasClass('inner'));
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

    test('validate() - invalid - calls setError and returns error', function() {
        var item = new List.Item({
            list: new List({
                schema: { validators: ['required', 'email'] }
            }),
            value: 'invalid'
        }).render();

        var spy = this.sinon.spy(item, 'setError');

        var err = item.validate();

        same(err.type, 'email');
        same(spy.callCount, 1, 'Called setError');
        same(spy.lastCall.args[0], err, 'Called with error');
    });

    test('validate() - valid - calls clearError and returns null', function() {
        var item = new List.Item({
            list: new List({
                schema: { validators: ['required', 'email'] }
            }),
            value: 'valid@example.com'
        }).render();

        var spy = this.sinon.spy(item, 'clearError');

        var err = item.validate();

        same(err, null);
        same(spy.callCount, 1, 'Called clearError');
    });

    test('setError()', function() {
        var item = new List.Item({ list: new List }).render();

        item.setError({ type: 'errType', message: 'ErrMessage' });

        ok(item.$el.hasClass(List.Item.errorClassName), 'Element has error class');
        same(item.$el.attr('title'), 'ErrMessage');
    });

    test('clearError()', function() {
        var item = new List.Item({ list: new List }).render();

        item.setError({ type: 'errType', message: 'ErrMessage' });

        item.clearError();

        same(item.$el.hasClass(item.errorClassName), false, 'Error class is removed from element');
        same(item.$el.attr('title'), undefined);
    });
})();



module('List.Modal', {
    setup: function() {
        this.sinon = sinon.sandbox.create();

        //ModalAdapter interface
        var MockModalAdapter = this.MockModalAdapter = Backbone.View.extend({
            open: function() {},
            close: function() {},
            preventClose: function() {}
        });

        this.sinon.stub(editors.List.Modal, 'ModalAdapter', MockModalAdapter);

        //Create editor to test
        this.editor = new editors.List.Modal({
            form: new Form()
        });
        
        //Force nestedSchema because this is usually done by Object or NestedModel constructors
        this.editor.nestedSchema = {
            id: { type: 'Number' },
            name: { }
        };
    },

    teardown: function() {
        this.sinon.restore();
    }
});


test('render() - when empty value, opens the modal', function() {
    var editor = this.editor;

    this.sinon.spy(editor, 'openEditor');
    this.sinon.spy(editor, 'renderSummary');

    editor.value = {};

    editor.render();

    equal(editor.openEditor.calledOnce, true);
    equal(editor.renderSummary.called, false);
});

test('render() - with value, renders the summary', function() {
    var editor = this.editor;

    this.sinon.spy(editor, 'openEditor');
    this.sinon.spy(editor, 'renderSummary');

    editor.value = { foo: 'bar' };
    editor.render();

    equal(editor.openEditor.called, false);
    equal(editor.renderSummary.calledOnce, true);
});

test('renderSummary()', function() {
    var editor = this.editor;

    editor.setValue({ id: 1, name: 'foo' });

    editor.renderSummary();

    equal(editor.$el.html(), '<div>Id: 1<br>Name: foo</div>');
});

test('itemToString() - formats an object', function() {
    var editor = this.editor;

    var result = editor.itemToString({ id: 1, name: 'foo' });

    equal(result, 'Id: 1<br />Name: foo');
});

test('getStringValue() - when empty', function() {
    this.editor.setValue({});

    equal(this.editor.getStringValue(), '[Empty]');
});

test('getStringValue() - with itemToString', function() {
    this.editor.schema.itemToString = function(val) {
        return 'foo';
    }

    this.editor.setValue({ id: 1, name: 'foo' });

    equal(this.editor.getStringValue(), 'foo');
});

test('getStringValue() - defaulting to built-in itemToString', function() {
    this.editor.setValue({ id: 1, name: 'foo' });

    equal(this.editor.getStringValue(), 'Id: 1<br />Name: foo');
});

test('openEditor() - opens the modal', function() {
    var editor = this.editor,
        value = { id: 1, name: 'foo' };

    editor.setValue(value);

    //Mocks
    this.sinon.spy(this.MockModalAdapter.prototype, 'initialize');
    this.sinon.spy(this.MockModalAdapter.prototype, 'open');

    editor.openEditor();

    ok(editor.modal instanceof this.MockModalAdapter);
    equal(this.MockModalAdapter.prototype.open.calledOnce, true);

    //Check how modal was instantiated
    var optionsArgs = this.MockModalAdapter.prototype.initialize.args[0][0],
        content = optionsArgs.content;

    ok(content instanceof Form);
    equal(content.schema, editor.nestedSchema);
    equal(content.data, value);
});

test('openEditor() - triggers open and focus events on the editor', function() {
    var editor = this.editor;

    //Mocks
    var openSpy = this.sinon.spy(),
        focusSpy = this.sinon.spy();

    editor.on('open', openSpy);
    editor.on('focus', focusSpy);

    editor.openEditor();

    equal(openSpy.calledOnce, true);
    equal(focusSpy.calledOnce, true);
});

test('openEditor() - responds to modal "cancel" event', function() {
    var editor = this.editor;

    this.sinon.spy(editor, 'onModalClosed');

    editor.openEditor();

    editor.modal.trigger('cancel');

    equal(editor.onModalClosed.calledOnce, true);
});

test('openEditor() - responds to modal "ok" event', function() {
    var editor = this.editor;

    this.sinon.spy(editor, 'onModalSubmitted');

    editor.openEditor();

    editor.modal.trigger('ok');

    equal(editor.onModalSubmitted.calledOnce, true);
});

test('onModalSubmitted - calls preventClose if validation fails', function() {
    var editor = this.editor;

    editor.openEditor();

    //Mocks
    this.sinon.stub(editor.modalForm, 'validate', function() {
        return 'err';
    });

    this.sinon.spy(editor.modal, 'preventClose');

    //Run
    editor.onModalSubmitted();

    //Test
    ok(editor.modal.preventClose.calledOnce);
});

test('onModalSubmitted - sets editor value and renders the summary', function() {
    var editor = this.editor;

    editor.openEditor();

    //Mocks
    this.sinon.stub(editor.modalForm, 'getValue', function() {
        return { foo: 'bar' };
    });

    this.sinon.spy(editor, 'renderSummary');

    //Run
    editor.onModalSubmitted();

    //Test
    ok(editor.renderSummary.calledOnce);
    deepEqual(editor.value, { foo: 'bar' });
});

test('onModalSubmitted - triggers "readyToAdd" if this is a new item (no previous value)', function() {
    var editor = this.editor;

    editor.value = null;

    editor.openEditor();

    //Mocks
    var readyToAddSpy = this.sinon.spy();
    editor.on('readyToAdd', readyToAddSpy)

    //Run
    editor.onModalSubmitted();

    //Test
    ok(readyToAddSpy.calledOnce);
});

test('onModalSubmitted - triggers "change" and calls onModalClosed', function() {
    var editor = this.editor;

    editor.openEditor();

    //Mocks
    var changeSpy = this.sinon.spy();
    editor.on('change', changeSpy);

    this.sinon.spy(editor, 'onModalClosed');

    //Run
    editor.onModalSubmitted();

    //Test
    ok(changeSpy.calledOnce);
    ok(editor.onModalClosed.calledOnce);
});

test('onModalClosed - triggers events and clears modal references', function() {
    var editor = this.editor;

    editor.openEditor();

    var closeSpy = this.sinon.spy();
    editor.on('close', closeSpy);

    var blurSpy = this.sinon.spy();
    editor.on('blur', blurSpy);

    editor.onModalClosed();

    equal(editor.modal, null);
    equal(editor.modalForm, null);

    ok(closeSpy.calledOnce);
    ok(blurSpy.calledOnce);
});

test('getValue()', function() {
    this.editor.value = { foo: 'bar' };

    equal(this.editor.getValue(), this.editor.value);
});

test('setValue()', function() {
    var value = { foo: 'bar' };

    this.editor.setValue(value);

    equal(this.editor.value, value);
});

test("focus() - opens the modal", function() {
    var editor = this.editor;

    this.sinon.spy(editor, 'openEditor');

    editor.focus();

    ok(editor.openEditor.calledOnce);
});

test("focus() - triggers the 'focus' event", function() {
    var editor = this.editor,
        spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.focus();

    ok(spy.called);
    ok(spy.calledWith(editor));
    ok(editor.hasFocus);
});

test("blur() - closes the modal", function() {
    var editor = this.editor;

    editor.focus();

    editor.blur()

    ok(!editor.modal);
    ok(!editor.hasFocus);
});

test("blur() - triggers the 'blur' event", function() {
    var editor = this.editor,
        spy = this.sinon.spy();

    editor.focus();

    editor.on('blur', spy);

    editor.blur();

    ok(spy.called);
    ok(spy.calledWith(editor));
});

test("'change' event - is triggered when the modal is submitted", function() {
    var editor = this.editor,
        spy = this.sinon.spy();

    editor.openEditor();

    editor.on('blur', spy);

    editor.modal.trigger('ok');

    ok(spy.calledOnce);
    ok(spy.alwaysCalledWith(editor));
});

test("'focus' event - is triggered when the modal is opened", function() {
    var editor = this.editor,
        spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.openEditor();

    ok(spy.calledOnce);
    ok(spy.alwaysCalledWith(editor));
});

test("'blur' event - is triggered when the modal is closed", function() {
    var editor = this.editor,
        spy = this.sinon.spy();

    editor.openEditor();

    editor.on('blur', spy);

    editor.modal.trigger('cancel');

    ok(spy.calledOnce);
    ok(spy.alwaysCalledWith(editor));
});

test("'open' event - is triggered when the modal is opened", function() {
    var editor = this.editor,
        spy = this.sinon.spy();

    editor.on('open', spy);

    editor.openEditor();

    ok(spy.calledOnce);
    ok(spy.alwaysCalledWith(editor));
});

test("'close' event - is triggered when the modal is closed", function() {
    var editor = this.editor,
        spy = this.sinon.spy();

    editor.openEditor();

    editor.on('close', spy);

    editor.modal.trigger('cancel');

    ok(spy.calledOnce);
    ok(spy.alwaysCalledWith(editor));
});




module('List.Object', {
    setup: function() {
        this.sinon = sinon.sandbox.create();

        //ModalAdapter interface
        var MockModalAdapter = this.MockModalAdapter = Backbone.View.extend({
            open: function() {},
            close: function() {},
            preventClose: function() {}
        });

        this.sinon.stub(editors.List.Modal, 'ModalAdapter', MockModalAdapter);

        //Create editor to test
        this.editor = new editors.List.Object({
            form: new Form(),
            schema: {
                subSchema: {
                    id: { type: 'Number' },
                    name: { }
                }
            }
        });
    },

    teardown: function() {
        this.sinon.restore();
    }
});

test('initialize() - sets the nestedSchema', function() {
    deepEqual(_.keys(this.editor.nestedSchema), ['id', 'name']);
});




module('List.NestedModel', {
    setup: function() {
        this.sinon = sinon.sandbox.create();

        //ModalAdapter interface
        var MockModalAdapter = this.MockModalAdapter = Backbone.View.extend({
            open: function() {},
            close: function() {},
            preventClose: function() {}
        });

        this.sinon.stub(editors.List.Modal, 'ModalAdapter', MockModalAdapter);

        //Create editor to test
        this.Model = Backbone.Model.extend({
            schema: {
                id: { type: 'Number' },
                name: { }
            }
        });

        this.editor = new editors.List.NestedModel({
            form: new Form(),
            schema: {
                model: this.Model
            }
        });
    },

    teardown: function() {
        this.sinon.restore();
    }
});

test('initialize() - sets the nestedSchema, when schema is object', function() {
    var Model = Backbone.Model.extend({
        schema: {
            id: { type: 'Number' },
            name: { }
        }
    });

    var editor = new editors.List.NestedModel({
        form: new Form(),
        schema: {
            model: Model
        }
    });

    deepEqual(_.keys(editor.nestedSchema), ['id', 'name']);
});

test('initialize() - sets the nestedSchema, when schema is function', function() {
    var Model = Backbone.Model.extend({
        schema: function() {
            return {
                id: { type: 'Number' },
                name: { }
            }
        }
    });

    var editor = new editors.List.NestedModel({
        form: new Form(),
        schema: {
            model: Model
        }
    });

    deepEqual(_.keys(editor.nestedSchema), ['id', 'name']);
});

test('getStringValue() - uses model.toString() if available', function() {
    this.Model.prototype.toString = function() {
        return 'foo!';
    }

    this.editor.setValue({ id: 1, name: 'foo' });

    equal(this.editor.getStringValue(), 'foo!');
});


})(Backbone.Form, Backbone.Form.Field, Backbone.Form.editors);
