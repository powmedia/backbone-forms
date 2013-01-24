var same = deepEqual;

;(function(Form, Field, editors) {

module('Base');

(function() {  
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


module('Text', {
    setup: function() {
        this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
        this.sinon.restore();
    }
});

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
    
    test("focus() - gives focus to editor and its input", function() {
        var field = window.form.fields.email.editor;

        field.focus();
        
        ok(field.hasFocus);
        ok(field.$el.is(':focus'));
    });

    test("focus() - triggers the 'focus' event", function() {
        var field = new editor({
            model: new Post,
            key: 'title'
        }).render();

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.focus();
        
        ok(spy.called);
        ok(spy.calledWith(field));
    });

    test("blur() - removes focus from the editor and its input", function() {
        var field = window.form.fields.email.editor;

        field.focus();

        field.blur();
        
        ok(!field.hasFocus);
        ok(!field.$el.is(':focus'));
    });

    test("blur() - triggers the 'blur' event", function() {
        var field = new editor({
            model: new Post,
            key: 'title'
        }).render();
        
        field.focus()

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.blur();
        
        ok(spy.called);
        ok(spy.calledWith(field));
    });
    
    test("select() - triggers the 'select' event", function() {
        var field = new editor({
            model: new Post,
            key: 'title'
        }).render();
        
        var spy = this.sinon.spy();

        field.on('select', spy);

        field.select();
        
        ok(spy.called);
        ok(spy.calledWith(field));
    });
    
    test("'change' event - is triggered when value of input changes", function() {
        var field = new editor({
            model: new Post,
            key: 'title'
        }).render();
        
        callCount = 0;

        var spy = this.sinon.spy();
        
        field.on('change', spy);
        
        // Pressing a key
        field.$el.keypress();
        field.$el.val('a');
        
        stop();
        setTimeout(function(){
            callCount++;
        
            field.$el.keyup();
        
            // Keeping a key pressed for a longer time
            field.$el.keypress();
            field.$el.val('ab');
            
            setTimeout(function(){
                callCount++;
                
                field.$el.keypress();
                field.$el.val('abb');
                
                setTimeout(function(){
                    callCount++;
                    
                    field.$el.keyup();
        
                    // Cmd+A; Backspace: Deleting everything
                    field.$el.keyup();
                    field.$el.val('');
                    field.$el.keyup();
                    callCount++;
        
                    // Cmd+V: Pasting something
                    field.$el.val('abdef');
                    field.$el.keyup();
                    callCount++;
        
                    // Left; Right: Pointlessly moving around
                    field.$el.keyup();
                    field.$el.keyup();

                    ok(spy.callCount == callCount);
                    ok(spy.alwaysCalledWith(field));
            
                    start();
                }, 0);
            }, 0);
        }, 0);
    });
    
    test("'focus' event - bubbles up from the input", function() {
        var field = new editor({
            model: new Post,
            key: 'title'
        }).render();

        var spy = this.sinon.spy();
        
        field.on('focus', spy);
        
        field.$el.focus();
        
        ok(spy.calledOnce);
        ok(spy.alwaysCalledWith(field));
    });
    
    test("'blur' event - bubbles up from the input", function() {
        var field = new editor({
            model: new Post,
            key: 'title'
        }).render();

        field.$el.focus();

        var spy = this.sinon.spy();
        
        field.on('blur', spy);
        
        field.$el.blur();

        ok(spy.calledOnce);
        ok(spy.alwaysCalledWith(field));
    });

    test("'select' event - bubbles up from the input", function() {
        var field = new editor({
            model: new Post,
            key: 'title'
        }).render();


        var spy = this.sinon.spy();
        
        field.on('select', spy);
        
        field.$el.select();

        ok(spy.calledOnce);
        ok(spy.alwaysCalledWith(field));
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




module('Number', {
    setup: function() {
        this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
        this.sinon.restore();
    }
});

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
    
    test("'change' event - is triggered when value of input changes and is valid", function() {
        var field = new editor({
            model: new Post,
            key: 'title'
        }).render();
        
        callCount = 0;

        var spy = this.sinon.spy();
        
        field.on('change', spy);
        
        // Pressing a valid key
        field.$el.keypress($.Event("keypress", { charCode: 48 }));
        field.$el.val('0');
        
        stop();
        setTimeout(function(){
            callCount++;
        
            field.$el.keyup();
        
            // Pressing an invalid key
            field.$el.keypress($.Event("keypress", { charCode: 65 }));
            
            setTimeout(function(){
                field.$el.keyup();
                
                // Pressing a valid key
                field.$el.keypress($.Event("keypress", { charCode: 49 }));
                field.$el.val('01');
                
                setTimeout(function(){
                    callCount++;
                    
                    field.$el.keyup();
        
                    // Cmd+A; Backspace: Deleting everything
                    field.$el.keyup();
                    field.$el.val('');
                    field.$el.keyup();
                    callCount++;

                    ok(spy.callCount == callCount);
                    ok(spy.alwaysCalledWith(field));
            
                    start();
                }, 0);
            }, 0);
        }, 0);
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



module('Checkbox', {
    setup: function() {
        this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
        this.sinon.restore();
    }
});

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
    
    test("focus() - gives focus to editor and its checkbox", function() {
        var field = window.form.fields.checkbox.editor;

        field.focus();
        
        ok(field.hasFocus);
        ok(field.$el.is(':focus'));
    });

    test("focus() - triggers the 'focus' event", function() {
        var field = new editor({
            model: new Model,
            key: 'enabled'
        }).render();

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.focus();
        
        ok(spy.called);
        ok(spy.calledWith(field));
    });

    test("blur() - removes focus from the editor and its checkbox", function() {
        var field = window.form.fields.checkbox.editor;

        field.focus();

        field.blur();
        
        ok(!field.hasFocus);
        ok(!field.$el.is(':focus'));
    });

    test("blur() - triggers the 'blur' event", function() {
        var field = new editor({
            model: new Model,
            key: 'enabled'
        }).render();
        
        field.focus()

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.blur();
        
        ok(spy.called);
        ok(spy.calledWith(field));
    });
    
    test("'change' event - is triggered when the checkbox is clicked", function() {
        var field = new editor({
            model: new Model,
            key: 'enabled'
        }).render();

        var spy = this.sinon.spy();
        
        field.on('change', spy);
        
        field.$el.click();
        
        ok(spy.calledOnce);
        ok(spy.alwaysCalledWith(field));
    });
    
    test("'focus' event - bubbles up from the checkbox", function() {
        var field = new editor({
            model: new Model,
            key: 'enabled'
        }).render();

        var spy = this.sinon.spy();
        
        field.on('focus', spy);
        
        field.$el.focus();
        
        ok(spy.calledOnce);
        ok(spy.alwaysCalledWith(field));
    });
    
    test("'blur' event - bubbles up from the checkbox", function() {
        var field = new editor({
            model: new Model,
            key: 'enabled'
        }).render();

        field.$el.focus();

        var spy = this.sinon.spy();
        
        field.on('blur', spy);
        
        field.$el.blur();

        ok(spy.calledOnce);
        ok(spy.alwaysCalledWith(field));
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




module('Select', {
    setup: function() {
        this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
        this.sinon.restore();
    }
});

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

    test('setOptions() - updates the options on a rendered select', function() {
        var field = new editor({
            schema: schema
        }).render();

        field.setOptions([1,2,3]);

        var newOptions = field.$el.find('option');

        equal(newOptions.length, 3);
        equal(newOptions.first().html(), 1);
        equal(newOptions.last().html(), 3);
    });
    
    test('TODO: Options as array of items', function() {

    });
    
    test('Options as array of objects', function() {
        var field = new editor({
            schema: schema
        }).render();

        field.setOptions([
            {
                val: 0,
                label: "Option 1"
            },
            {
                val: 1,
                label: "Option 2"
            },
            {
                val: 2,
                label: "Option 3"
            }
        ]);

        var newOptions = field.$el.find('option');

        equal(newOptions.length, 3);
        equal(newOptions.first().html(), "Option 1");
        equal(newOptions.last().html(), "Option 3");

        equal(newOptions.first().val(), "0");
        equal(newOptions.last().val(), "2");
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
    
    test("focus() - gives focus to editor and its selectbox", function() {
        var field = window.form.fields.select.editor;

        field.focus();
        
        ok(field.hasFocus);
        ok(field.$el.is(':focus'));
    });

    test("focus() - triggers the 'focus' event", function() {
        var field = new editor({
            value: 'Pam',
            schema: schema
        }).render();

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.focus();
        
        ok(spy.called);
        ok(spy.calledWith(field));
    });

    test("blur() - removes focus from the editor and its selectbox", function() {
        var field = window.form.fields.select.editor;

        field.focus();

        field.blur();
        
        ok(!field.hasFocus);
        ok(!field.$el.is(':focus'));
    });

    test("blur() - triggers the 'blur' event", function() {
        var field = new editor({
            value: 'Pam',
            schema: schema
        }).render();
        
        field.focus()

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.blur();
        
        ok(spy.called);
        ok(spy.calledWith(field));
    });
    
    test("'change' event - bubbles up from the selectbox", function() {
        var field = new editor({
            value: 'Pam',
            schema: schema
        }).render();

        var spy = this.sinon.spy();
        
        field.on('change', spy);
        
        field.$el.val('Cyril');
        field.$el.change();
        
        ok(spy.calledOnce);
        ok(spy.alwaysCalledWith(field));
    });
    
    test("'focus' event - bubbles up from the selectbox", function() {
        var field = new editor({
            value: 'Pam',
            schema: schema
        }).render();

        var spy = this.sinon.spy();
        
        field.on('focus', spy);
        
        field.$el.focus();
        
        ok(spy.calledOnce);
        ok(spy.alwaysCalledWith(field));
    });
    
    test("'blur' event - bubbles up from the selectbox", function() {
        var field = new editor({
            value: 'Pam',
            schema: schema
        }).render();

        field.$el.focus();

        var spy = this.sinon.spy();
        
        field.on('blur', spy);
        
        field.$el.blur();

        ok(spy.calledOnce);
        ok(spy.alwaysCalledWith(field));
    });

})();




module('Radio', {
    setup: function() {
        this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
        this.sinon.restore();
    }
});

(function() {
    var editor = editors.Radio,
        schema = {
            options: ['Sterling', 'Lana', 'Cyril', 'Cheryl', 'Pam']
        };

    test('Options as array of objects', function() {
        var field = new editor({
            schema: {
                options: [
                    {
                        val: 0,
                        label: "Option 1"
                    },
                    {
                        val: 1,
                        label: "Option 2"
                    },
                    {
                        val: 2,
                        label: "Option 3"
                    }
                ]
            }
        }).render();

        var radios = field.$el.find("input[type=radio]");
        var labels = field.$el.find("label");

        equal(radios.length, 3);
        equal(radios.length, labels.length);

        equal(labels.first().html(), "Option 1");
        equal(labels.last().html(), "Option 3");

        equal(radios.first().val(), "0");
        equal(radios.last().val(), "2");
    });

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
    
    test("focus() - gives focus to editor and its first radiobutton when no radiobutton is checked", function() {
        var field = window.form.fields.radio.editor;

        field.focus();
        
        ok(field.hasFocus);
        ok(field.$('input[type=radio]').first().is(':focus'));
        
        field.blur();
        
        stop();
        setTimeout(function() {
          start();
        }, 0);
    });
    
    test("focus() - gives focus to editor and its checked radiobutton when a radiobutton is checked", function() {
        var field = window.form.fields.radio.editor;
        
        field.$('input[type=radio]').val([field.$('input[type=radio]').eq(1).val()]);

        field.focus();
        
        ok(field.hasFocus);
        ok(field.$('input[type=radio]').eq(1).is(':focus'));
        
        field.$('input[type=radio]').val([null]);
        
        field.blur();
        
        stop();
        setTimeout(function() {
          start();
        }, 0);
    });

    test("focus() - triggers the 'focus' event", function() {
        var field = window.form.fields.radio.editor;

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.focus();

        stop();
        setTimeout(function() {
          ok(spy.called);
          ok(spy.calledWith(field));

          field.blur();

          setTimeout(function() {
            start();
          }, 0);
        }, 0);
    });

    test("blur() - removes focus from the editor and its focused radiobutton", function() {
        var field = window.form.fields.radio.editor;

        field.focus();

        field.blur();

        stop();
        setTimeout(function() {
          ok(!field.hasFocus);
          ok(!field.$('input[type=radio]').first().is(':focus'));

          start();
        }, 0);
    });

    test("blur() - triggers the 'blur' event", function() {
        var field = window.form.fields.radio.editor;

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
    });

    test("'change' event - is triggered when a non-checked radiobutton is clicked", function() {
        var field = window.form.fields.radio.editor;

        var spy = this.sinon.spy();

        field.on('change', spy);
        
        field.$("input[type=radio]:not(:checked)").first().click();

        ok(spy.called);
        ok(spy.calledWith(field));
        
        field.$("input[type=radio]").val([null]);
    });

    test("'focus' event - bubbles up from radiobutton when editor doesn't have focus", function() {
        var field = window.form.fields.radio.editor;

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.$("input[type=radio]").first().focus();

        ok(spy.called);
        ok(spy.calledWith(field));
        
        field.blur();
        
        stop();
        setTimeout(function() {
          start();
        }, 0);
    });

    test("'focus' event - doesn't bubble up from radiobutton when editor already has focus", function() {
        var field = window.form.fields.radio.editor;

        field.focus();

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.$("input[type=radio]").focus();

        ok(!spy.called);
        
        field.blur();
        
        stop();
        setTimeout(function() {
          start();
        }, 0);
    });

    test("'blur' event - bubbles up from radiobutton when editor has focus and we're not focusing on another one of the editor's radiobuttons", function() {
        var field = window.form.fields.radio.editor;

        field.focus();

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.$("input[type=radio]").first().blur();

        stop();
        setTimeout(function() {
            ok(spy.called);
            ok(spy.calledWith(field));

            start();
        }, 0);
    });

    test("'blur' event - doesn't bubble up from radiobutton when editor has focus and we're focusing on another one of the editor's radiobuttons", function() {
        var field = window.form.fields.radio.editor;

        field.focus();

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.$("input[type=radio]:eq(0)").blur();
        field.$("input[type=radio]:eq(1)").focus();

        stop();
        setTimeout(function() {
            ok(!spy.called);

            field.blur();

            setTimeout(function() {
              start();
            }, 0);
        }, 0);
    });

    test("'blur' event - doesn't bubble up from radiobutton when editor doesn't have focus", function() {
        var field = window.form.fields.radio.editor;

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.$("input[type=radio]").blur();

        stop();
        setTimeout(function() {
            ok(!spy.called);

            start();
        }, 0);
    });

})();


module('Checkboxes', {
    setup: function() {
        this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
        this.sinon.restore();
    }
});

(function() {
    var editor = editors.Checkboxes,
        schema = {
            options: ['Sterling', 'Lana', 'Cyril', 'Cheryl', 'Pam', 'Doctor Krieger']
        };

    test('Options as array of objects', function() {
        var field = new editor({
            schema: {
                options: [
                    {
                        val: 0,
                        label: "Option 1"
                    },
                    {
                        val: 1,
                        label: "Option 2"
                    },
                    {
                        val: 2,
                        label: "Option 3"
                    }
                ]
            }
        }).render();

        var checkboxes = field.$el.find("input[type=checkbox]");
        var labels = field.$el.find("label");

        equal(checkboxes.length, 3);
        equal(checkboxes.length, labels.length);

        equal(labels.first().html(), "Option 1");
        equal(labels.last().html(), "Option 3");

        equal(checkboxes.first().val(), "0");
        equal(checkboxes.last().val(), "2");
    });

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
    
    test("focus() - gives focus to editor and its first checkbox", function() {
        var field = window.form.fields.checkboxes.editor;

        field.focus();
        
        ok(field.hasFocus);
        ok(field.$('input[type=checkbox]').first().is(':focus'));
        
        field.blur();
        
        stop();
        setTimeout(function() {
          start();
        }, 0);
    });

    test("focus() - triggers the 'focus' event", function() {
        var field = window.form.fields.checkboxes.editor;

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.focus();

        stop();
        setTimeout(function() {
          ok(spy.called);
          ok(spy.calledWith(field));

          field.blur();

          setTimeout(function() {
            start();
          }, 0);
        }, 0);
    });

    test("blur() - removes focus from the editor and its focused checkbox", function() {
        var field = window.form.fields.checkboxes.editor;

        field.focus();

        field.blur();

        stop();
        setTimeout(function() {
          ok(!field.hasFocus);
          ok(!field.$('input[type=checkbox]').first().is(':focus'));

          start();
        }, 0);
    });

    test("blur() - triggers the 'blur' event", function() {
        var field = window.form.fields.checkboxes.editor;

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
    });

    test("'change' event - is triggered when a checkbox is clicked", function() {
        var field = window.form.fields.checkboxes.editor;

        var spy = this.sinon.spy();

        field.on('change', spy);
        
        field.$("input[type=checkbox]").first().click();

        ok(spy.called);
        ok(spy.calledWith(field));
        
        field.$("input[type=checkbox]").val([null]);
    });

    test("'focus' event - bubbles up from checkbox when editor doesn't have focus", function() {
        var field = window.form.fields.checkboxes.editor;

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.$("input[type=checkbox]").first().focus();

        ok(spy.called);
        ok(spy.calledWith(field));
        
        field.blur();
        
        stop();
        setTimeout(function() {
          start();
        }, 0);
    });

    test("'focus' event - doesn't bubble up from checkbox when editor already has focus", function() {
        var field = window.form.fields.checkboxes.editor;

        field.focus();

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.$("input[type=checkbox]").focus();

        ok(!spy.called);
        
        field.blur();
        
        stop();
        setTimeout(function() {
          start();
        }, 0);
    });

    test("'blur' event - bubbles up from checkbox when editor has focus and we're not focusing on another one of the editor's checkboxes", function() {
        var field = window.form.fields.checkboxes.editor;

        field.focus();

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.$("input[type=checkbox]").first().blur();

        stop();
        setTimeout(function() {
            ok(spy.called);
            ok(spy.calledWith(field));

            start();
        }, 0);
    });

    test("'blur' event - doesn't bubble up from checkbox when editor has focus and we're focusing on another one of the editor's checkboxes", function() {
        var field = window.form.fields.checkboxes.editor;

        field.focus();

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.$("input[type=checkbox]:eq(0)").blur();
        field.$("input[type=checkbox]:eq(1)").focus();

        stop();
        setTimeout(function() {
            ok(!spy.called);

            field.blur();

            setTimeout(function() {
              start();
            }, 0);
        }, 0);
    });

    test("'blur' event - doesn't bubble up from checkbox when editor doesn't have focus", function() {
        var field = window.form.fields.checkboxes.editor;

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.$("input[type=checkbox]").blur();

        stop();
        setTimeout(function() {
            ok(!spy.called);

            start();
        }, 0);
    });

})();




module('Object', {
    setup: function() {
        this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
        this.sinon.restore();
    }
});

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


    test("focus() - gives focus to editor and its form", function() {
        var field = new editor({
            schema: schema
        }).render();

        field.focus();

        stop();
        setTimeout(function() {
          ok(field.hasFocus);
          ok(field.form.hasFocus);

          start();
        }, 0);
    });

    test("focus() - triggers the 'focus' event", function() {
        var field = new editor({
            schema: schema
        }).render();

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.focus();

        stop();
        setTimeout(function() {
          ok(spy.called);
          ok(spy.calledWith(field));

          start();
        }, 0);
    });

    test("blur() - removes focus from the editor and its form", function() {
        var field = new editor({
            schema: schema
        }).render();

        field.focus();

        field.blur();

        stop();
        setTimeout(function() {
          ok(!field.hasFocus);
          ok(!field.form.hasFocus);

          start();
        }, 0);
    });

    test("blur() - triggers the 'blur' event", function() {
        var field = new editor({
            schema: schema
        }).render();

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
    });

    test("'change' event - bubbles up from the form", function() {
        var field = new editor({
            schema: schema
        }).render();

        var spy = this.sinon.spy();

        field.on('change', spy);

        field.form.trigger('change', field.form);

        ok(spy.called);
        ok(spy.calledWith(field));
    });

    test("'focus' event - bubbles up from the form when editor doesn't have focus", function() {
        var field = new editor({
            schema: schema
        }).render();

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.form.focus();

        ok(spy.called);
        ok(spy.calledWith(field));
    });

    test("'focus' event - doesn't bubble up from the field when editor already has focus", function() {
        var field = new editor({
            schema: schema
        }).render();

        field.focus();

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.form.focus();

        ok(!spy.called);
    });

    test("'blur' event - bubbles up from the form when editor has focus", function() {
        var field = new editor({
            schema: schema
        }).render();

        field.focus();

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.form.blur();

        stop();
        setTimeout(function() {
            ok(spy.called);
            ok(spy.calledWith(field));

            start();
        }, 0);
    });

    test("'blur' event - doesn't bubble up from the form when editor doesn't have focus", function() {
        var field = new editor({
            schema: schema
        }).render();

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.form.blur();

        stop();
        setTimeout(function() {
            ok(!spy.called);

            start();
        }, 0);
    });

    test("Events bubbling up from the form", function() {
        var field = new editor({
            schema: schema
        }).render();

        var spy = this.sinon.spy();

        field.on('whatever', spy);

        field.form.trigger('whatever', field.form);

        ok(spy.called);
        ok(spy.calledWith(field));
    });
})();




module('NestedModel');

(function() {
    
    var ChildModel = Backbone.Model.extend({
        schema: {
            id: { type: 'Number' },
            name: {}
        },
        defaults: {
            id: 8,
            name: 'Marklar'
        }
    });
    
    var editor = editors.NestedModel,
        schema = { model: ChildModel };
    
    test('Default value', function() {
        var field = new editor({
            schema: schema
        }).render();
        
        deepEqual(field.getValue(), { id: 8, name: 'Marklar' });
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

    test('Custom value overrides default value (issue #99)', function() {
        var Person = Backbone.Model.extend({
            schema: { firstName: 'Text', lastName: 'Text' },
            defaults: { firstName: '', lastName: '' }
        });

        var Duo = Backbone.Model.extend({
            schema: {
                name: { type: 'Text' },
                hero: { type: 'NestedModel', model: Person },
                sidekick: { type: 'NestedModel', model: Person}
            }
        });

        var batman = new Person({ firstName: 'Bruce', lastName: 'Wayne' });
        var robin = new Person({ firstName: 'Dick', lastName: 'Grayson' });

        var duo = new Duo({
            name: "The Dynamic Duo", 
            hero: batman, 
            sidekick: robin
        });

        var duoForm = new Backbone.Form({ model: duo }).render();
        var batmanForm = new Backbone.Form({ model: batman }).render();

        same(duoForm.getValue().hero, {
            firstName: 'Bruce', 
            lastName: 'Wayne'
        });
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


module('Date', {
    setup: function() {
        this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
        this.sinon.restore();
    }
});

(function() {
    var Editor = editors.Date;

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

    test('render() - with yearStart after yearEnd', function() {
        var editor = new Editor({
            schema: {
                yearStart: 2000,
                yearEnd: 1990
            }
        }).render();

        same(editor.$year.find('option:first').val(), editor.schema.yearStart.toString());
        same(editor.$year.find('option:last').val(), editor.schema.yearEnd.toString());
        same(editor.$year.find('option:first').html(), editor.schema.yearStart.toString());
        same(editor.$year.find('option:last').html(), editor.schema.yearEnd.toString());
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

    test('updates the hidden input when a value changes', function() {
        var date = new Date(2012, 2, 5);

        var editor = new Editor({
            schema: {
                yearStart: 2000,
                yearEnd: 2020
            },
            value: date
        }).render();

        //Simulate changing the date manually
        editor.$year.val(2020).trigger('change');
        editor.$month.val(6).trigger('change');
        editor.$date.val(13).trigger('change');

        var hiddenVal = new Date(editor.$hidden.val());

        same(editor.getValue().getTime(), hiddenVal.getTime());
        same(hiddenVal.getFullYear(), 2020);
        same(hiddenVal.getMonth(), 6);
        same(hiddenVal.getDate(), 13);
    });
    
    
    test("focus() - gives focus to editor and its first selectbox", function() {
        var field = window.form.fields.date.editor;

        field.focus();
        
        ok(field.hasFocus);
        ok(field.$('select').first().is(':focus'));
        
        field.blur();
        
        stop();
        setTimeout(function() {
          start();
        }, 0);
    });

    test("focus() - triggers the 'focus' event", function() {
        var field = window.form.fields.date.editor;

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.focus();

        stop();
        setTimeout(function() {
          ok(spy.called);
          ok(spy.calledWith(field));

          field.blur();

          setTimeout(function() {
            start();
          }, 0);
        }, 0);
    });

    test("blur() - removes focus from the editor and its focused selectbox", function() {
        var field = window.form.fields.date.editor;

        field.focus();

        field.blur();

        stop();
        setTimeout(function() {
          ok(!field.hasFocus);
          ok(!field.$('input[type=selectbox]').first().is(':focus'));

          start();
        }, 0);
    });

    test("blur() - triggers the 'blur' event", function() {
        var field = window.form.fields.date.editor;

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
    });

    test("'change' event - bubbles up from the selectbox", function() {
        var field = window.form.fields.date.editor;

        var spy = this.sinon.spy();

        field.on('change', spy);
        
        field.$("select").first().val('31');
        field.$("select").first().change();

        ok(spy.called);
        ok(spy.calledWith(field));
    });

    test("'focus' event - bubbles up from selectbox when editor doesn't have focus", function() {
        var field = window.form.fields.date.editor;

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.$("select").first().focus();

        ok(spy.called);
        ok(spy.calledWith(field));
        
        field.blur();
        
        stop();
        setTimeout(function() {
          start();
        }, 0);
    });

    test("'focus' event - doesn't bubble up from selectbox when editor already has focus", function() {
        var field = window.form.fields.date.editor;

        field.focus();

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.$("select").focus();

        ok(!spy.called);
        
        field.blur();
        
        stop();
        setTimeout(function() {
          start();
        }, 0);
    });

    test("'blur' event - bubbles up from selectbox when editor has focus and we're not focusing on another one of the editor's selectboxes", function() {
        var field = window.form.fields.date.editor;

        field.focus();

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.$("select").first().blur();

        stop();
        setTimeout(function() {
            ok(spy.called);
            ok(spy.calledWith(field));

            start();
        }, 0);
    });

    test("'blur' event - doesn't bubble up from selectbox when editor has focus and we're focusing on another one of the editor's selectboxes", function() {
        var field = window.form.fields.date.editor;

        field.focus();

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.$("select:eq(0)").blur();
        field.$("select:eq(1)").focus();

        stop();
        setTimeout(function() {
            ok(!spy.called);

            field.blur();

            setTimeout(function() {
              start();
            }, 0);
        }, 0);
    });

    test("'blur' event - doesn't bubble up from selectbox when editor doesn't have focus", function() {
        var field = window.form.fields.date.editor;

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.$("select").blur();

        stop();
        setTimeout(function() {
            ok(!spy.called);

            start();
        }, 0);
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
    var DateEditor = editors.Date,
        Editor = editors.DateTime;

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
            dateTime: '\
                <div>\
                    <div class="foo">{{date}}</div>\
                    <select data-type="hour">{{hours}}</select>\
                    :\
                    <select data-type="min">{{mins}}</select>\
                </div>\
            '
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

    test('updates the hidden input when a value changes', function() {
        var date = new Date();

        var editor = new Editor({
            value: date
        }).render();

        //Simulate changing the date manually
        editor.$hour.val(5).trigger('change');
        editor.$min.val(15).trigger('change');

        var hiddenVal = new Date(editor.$hidden.val());

        same(editor.getValue().getTime(), hiddenVal.getTime());
        same(hiddenVal.getHours(), 5);
        same(hiddenVal.getMinutes(), 15);
    });

    test('remove() - removes the date editor and self', function() {
        this.sinon.spy(DateEditor.prototype, 'remove');
        this.sinon.spy(editors.Base.prototype, 'remove');

        var editor = new Editor().render();

        editor.remove();

        ok(DateEditor.prototype.remove.calledOnce);
        ok(editors.Base.prototype.remove.calledOnce);
    });
    
    
    test("focus() - gives focus to editor and its first selectbox", function() {
        var field = window.form.fields.dateTime.editor;

        field.focus();
        
        ok(field.hasFocus);
        ok(field.$('select').first().is(':focus'));
        
        field.blur();
        
        stop();
        setTimeout(function() {
          start();
        }, 0);
    });

    test("focus() - triggers the 'focus' event", function() {
        var field = window.form.fields.dateTime.editor;

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.focus();

        stop();
        setTimeout(function() {
          ok(spy.called);
          ok(spy.calledWith(field));

          field.blur();

          setTimeout(function() {
            start();
          }, 0);
        }, 0);
    });

    test("blur() - removes focus from the editor and its focused selectbox", function() {
        var field = window.form.fields.dateTime.editor;

        field.focus();

        field.blur();

        stop();
        setTimeout(function() {
          ok(!field.hasFocus);
          ok(!field.$('input[type=selectbox]').first().is(':focus'));

          start();
        }, 0);
    });

    test("blur() - triggers the 'blur' event", function() {
        var field = window.form.fields.dateTime.editor;

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
    });

    test("'change' event - bubbles up from the selectbox", function() {
        var field = window.form.fields.dateTime.editor;

        var spy = this.sinon.spy();

        field.on('change', spy);
        
        field.$("select").first().val('31');
        field.$("select").first().change();

        ok(spy.called);
        ok(spy.calledWith(field));
    });

    test("'focus' event - bubbles up from selectbox when editor doesn't have focus", function() {
        var field = window.form.fields.dateTime.editor;

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.$("select").first().focus();

        ok(spy.called);
        ok(spy.calledWith(field));
        
        field.blur();
        
        stop();
        setTimeout(function() {
          start();
        }, 0);
    });

    test("'focus' event - doesn't bubble up from selectbox when editor already has focus", function() {
        var field = window.form.fields.dateTime.editor;

        field.focus();

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.$("select").focus();

        ok(!spy.called);
        
        field.blur();
        
        stop();
        setTimeout(function() {
          start();
        }, 0);
    });

    test("'blur' event - bubbles up from selectbox when editor has focus and we're not focusing on another one of the editor's selectboxes", function() {
        var field = window.form.fields.dateTime.editor;

        field.focus();

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.$("select").first().blur();

        stop();
        setTimeout(function() {
            ok(spy.called);
            ok(spy.calledWith(field));

            start();
        }, 0);
    });

    test("'blur' event - doesn't bubble up from selectbox when editor has focus and we're focusing on another one of the editor's selectboxes", function() {
        var field = window.form.fields.dateTime.editor;

        field.focus();

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.$("select:eq(0)").blur();
        field.$("select:eq(1)").focus();

        stop();
        setTimeout(function() {
            ok(!spy.called);

            field.blur();

            setTimeout(function() {
              start();
            }, 0);
        }, 0);
    });

    test("'blur' event - doesn't bubble up from selectbox when editor doesn't have focus", function() {
        var field = window.form.fields.dateTime.editor;

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.$("select").blur();

        stop();
        setTimeout(function() {
            ok(!spy.called);

            start();
        }, 0);
    });
})();



})(Backbone.Form, Backbone.Form.Field, Backbone.Form.editors);
