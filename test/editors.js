var same = deepEqual;

;(function(Form, Field, editors) {





























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
        ok(1);
    });

    test("TODO: Validation on nested model", function() {
        ok(1);
    });

    test('TODO: uses the nestedField template, unless overridden in field schema', function() {
        ok(1);
    });

    test("TODO: remove() - Removes embedded form", function() {
        ok(1);
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
