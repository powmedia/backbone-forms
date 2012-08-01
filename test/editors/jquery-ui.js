/*
module('jqueryui.Date', {
    setup: function() {
        this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
        this.sinon.restore();
    }
});

(function() {
    test("focus() - gives focus to editor and shows the datepicker", function() {
        var field = window.form.fields.jqueryDate.editor;

        field.focus();
        
        ok(field.hasFocus);
        ok(field.$('input').datepicker('widget').is(':visible'));
        
        field.blur();
        
        stop();
        setTimeout(function() {
          start();
        }, 0);
    });

    test("focus() - triggers the 'focus' event", function() {
        var field = window.form.fields.jqueryDate.editor;

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.focus();

        ok(spy.called);
        ok(spy.calledWith(field));

        field.blur();
    });

    test("blur() - removes focus from the editor and hides the datepicker", function() {
        var field = window.form.fields.jqueryDate.editor;

        field.focus();

        field.blur();
        
        ok(!field.hasFocus);
        ok(!field.$('input').datepicker('widget').is(':visible'));
    });

    test("blur() - triggers the 'blur' event", function() {
        var field = window.form.fields.jqueryDate.editor;

        field.focus();

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.blur();
        
        ok(spy.called);
        ok(spy.calledWith(field));
    });

    test("'change' event - is triggered when a date is selected in the datepicker", function() {
        var field = window.form.fields.jqueryDate.editor;

        var spy = this.sinon.spy();
        
        field.focus();

        field.on('change', spy);
        
        field.$('input').datepicker('widget').find('td').first().click();

        ok(spy.called);
        ok(spy.calledWith(field));
    });

    test("'focus' event - is triggered when the datepicker is shown", function() {
        var field = window.form.fields.jqueryDate.editor;

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.$("input").first().focus();

        ok(spy.called);
        ok(spy.calledWith(field));
        
        field.blur();
    });

    test("'blur' event - is triggered when the datepicker is hidden", function() {
        var field = window.form.fields.jqueryDate.editor;

        field.focus();

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.$('input').datepicker('widget').find('td').first().click();

        ok(spy.called);
        ok(spy.calledWith(field));
    });
})();



module('jqueryui.DateTime', {
    setup: function() {
        this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
        this.sinon.restore();
    }
});

(function() {
    test("focus() - gives focus to editor and shows the datepicker", function() {
        var field = window.form.fields.jqueryDateTime.editor;

        field.focus();
        
        ok(field.hasFocus);
        ok(field.$('input').datepicker('widget').is(':visible'));
        
        field.blur();
        
        stop();
        setTimeout(function() {
          start();
        }, 0);
    });

    test("focus() - triggers the 'focus' event", function() {
        var field = window.form.fields.jqueryDateTime.editor;

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.focus();

        ok(spy.called);
        ok(spy.calledWith(field));

        field.blur();
    });

    test("blur() - removes focus from the editor and hides the datepicker", function() {
        var field = window.form.fields.jqueryDateTime.editor;

        field.focus();

        field.blur();
        
        ok(!field.hasFocus);
        ok(!field.$('input').datepicker('widget').is(':visible'));
    });

    test("blur() - triggers the 'blur' event", function() {
        var field = window.form.fields.jqueryDateTime.editor;

        field.focus();

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.blur();
        
        ok(spy.called);
        ok(spy.calledWith(field));
    });

    test("'change' event - is triggered when a date is selected in the datepicker", function() {
        var field = window.form.fields.jqueryDateTime.editor;

        var spy = this.sinon.spy();
        
        field.focus();

        field.on('change', spy);
        
        field.$('input').datepicker('widget').find('td').first().click();

        ok(spy.called);
        ok(spy.calledWith(field));
    });

    test("'focus' event - is triggered when the datepicker is shown", function() {
        var field = window.form.fields.jqueryDateTime.editor;

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.$("input").first().focus();

        ok(spy.called);
        ok(spy.calledWith(field));
        
        field.blur();
    });

    test("'blur' event - is triggered when the datepicker is hidden", function() {
        var field = window.form.fields.jqueryDateTime.editor;

        field.focus();

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.$('input').datepicker('widget').find('td').first().click();

        ok(spy.called);
        ok(spy.calledWith(field));
    });
})();

module('jqueryui.List', {
    setup: function() {
        this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
        this.sinon.restore();
    }
});

(function() {
    test("focus() - gives focus to editor and shows the first item's editor dialog", function() {
        var field = window.form.fields.jqueryList.editor;

        field.focus();
        
        ok(field.editorContainer);
        ok(field.hasFocus);
        
        field.blur();
    });

    test("focus() - triggers the 'focus' event", function() {
        var field = window.form.fields.jqueryList.editor;

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.focus();
        
        ok(spy.called);
        ok(spy.calledWith(field));
        
        field.blur();
    });

    test("blur() - removes focus from the editor and hides its first item's editor dialog", function() {
        var field = window.form.fields.jqueryList.editor;

        field.focus();

        field.blur();
        
        ok(!field.editorContainer);
        ok(!field.hasFocus);
    });

    test("blur() - triggers the 'blur' event", function() {
        var field = window.form.fields.jqueryList.editor;

        field.focus();

        var spy = this.sinon.spy();

        field.on('blur', spy);

        field.blur();
        
        ok(spy.called);
        ok(spy.calledWith(field));
    });

    test("'change' and 'item:change' events - are triggered when the item's editor dialog is submitted after editing an item", function() {
        var field = window.form.fields.jqueryList.editor;
        
        field.$('li .bbf-list-edit').first().click();

        var spy1 = this.sinon.spy();
        var spy2 = this.sinon.spy();

        field.on('change', spy1);
        field.on('item:change', spy2);

        field.editorContainer.dialog('widget').find("button:contains('OK')").click();

        ok(spy1.called);
        ok(spy1.calledWith(field));
        ok(spy2.called);
        ok(spy2.calledWith(field));
    });
    
    test("'change' and 'item:change' events - are triggered when the item's editor dialog is submitted after adding an item", function() {
        var field = window.form.fields.jqueryList.editor;

        var spy1 = this.sinon.spy();
        var spy2 = this.sinon.spy();

        field.on('change', spy1);
        field.on('item:change', spy2);

        field.addNewItem();
        field.editorContainer.dialog('widget').find("button:contains('OK')").click();

        ok(spy1.called);
        ok(spy1.calledWith(field));
        ok(spy2.called);
        ok(spy2.calledWith(field));
    });
    
    test("'change' event - is triggered when an item is removed", function() {
        var field = window.form.fields.jqueryList.editor;

        var spy = this.sinon.spy();

        field.on('change', spy);

        field.$('li .bbf-list-del').first().click();

        ok(spy.called);
        ok(spy.calledWith(field));
    });

    test("'focus', 'item:focus' and 'item:open' events - are triggered when an item's editor dialog is opened", function() {
        var field = window.form.fields.jqueryList.editor;

        var spy1 = this.sinon.spy();
        var spy2 = this.sinon.spy();
        var spy3 = this.sinon.spy();

        field.on('focus', spy1);
        field.on('item:focus', spy2);
        field.on('item:open', spy3);

        field.$('li .bbf-list-edit').first().click();

        ok(spy1.called);
        ok(spy1.calledWith(field));
        ok(spy2.called);
        ok(spy2.calledWith(field));
        ok(spy3.called);
        ok(spy3.calledWith(field));
        
        field.blur();
    });

    test("'blur', 'item:blur' and 'item:close' events - are triggered when an item's editor dialog is closed", function() {
        var field = window.form.fields.jqueryList.editor;

        field.$('li .bbf-list-edit').first().click();

        var spy1 = this.sinon.spy();
        var spy2 = this.sinon.spy();
        var spy3 = this.sinon.spy();

        field.on('blur', spy1);
        field.on('item:blur', spy2);
        field.on('item:close', spy3);

        field.editorContainer.dialog('widget').find("button:contains('OK')").click();
        
        ok(spy1.called);
        ok(spy1.calledWith(field));
        ok(spy2.called);
        ok(spy2.calledWith(field));
        ok(spy3.called);
        ok(spy3.calledWith(field));
    });
    
    test("'add' event - is triggered when an item is added", function() {
        var field = window.form.fields.jqueryList.editor;
        
        var value = "Value";

        var spy = this.sinon.spy();
        
        field.on('add', spy);

        field.addNewItem();
        field.editorContainer.dialog('widget').find("input").val(value)
        field.editorContainer.dialog('widget').find("button:contains('OK')").click();

        ok(spy.called);
        ok(spy.calledWith(field, value));
    });
    
    test("'remove' event - is triggered when an item is removed", function() {
        var field = window.form.fields.jqueryList.editor;
        
        var item = field.$('li').first();
        var value = item.data('data')

        var spy = this.sinon.spy();
        
        field.on('remove', spy);

        item.find('.bbf-list-del').click();

        ok(spy.called);
        ok(spy.calledWith(field, value));
    });
})();
*/