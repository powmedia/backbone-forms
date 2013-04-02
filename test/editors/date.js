;(function(Form, Editor) {

  module('Date', {
    setup: function() {
      this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
      this.sinon.restore();
    }
  });


  var same = deepEqual;


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



  module('Date events', {
    setup: function() {
      this.sinon = sinon.sandbox.create();

      this.editor = new Editor().render();

      $('body').append(this.editor.el);
    },

    teardown: function() {
      this.sinon.restore();

      this.editor.remove();
    }
  });

  test("focus() - gives focus to editor and its first selectbox", function() {
    var editor = this.editor;

    editor.focus();

    ok(editor.hasFocus);
    ok(editor.$('select').first().is(':focus'));

    editor.blur();

    stop();
    setTimeout(function() {
      start();
    }, 0);
  });

  test("focus() - triggers the 'focus' event", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.focus();

    stop();
    setTimeout(function() {
      ok(spy.called);
      ok(spy.calledWith(editor));

      editor.blur();

      setTimeout(function() {
        start();
      }, 0);
    }, 0);
  });

  test("blur() - removes focus from the editor and its focused selectbox", function() {
    var editor = this.editor;

    editor.focus();

    editor.blur();

    stop();
    setTimeout(function() {
      ok(!editor.hasFocus);
      ok(!editor.$('input[type=selectbox]').first().is(':focus'));

      start();
    }, 0);
  });

  test("blur() - triggers the 'blur' event", function() {
    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.blur();

    stop();
    setTimeout(function() {
      ok(spy.called);
      ok(spy.calledWith(editor));

      start();
    }, 0);
  });

  test("'change' event - bubbles up from the selectbox", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('change', spy);

    editor.$("select").first().val('31');
    editor.$("select").first().change();

    ok(spy.called);
    ok(spy.calledWith(editor));
  });

  test("'focus' event - bubbles up from selectbox when editor doesn't have focus", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.$("select").first().focus();

    ok(spy.called);
    ok(spy.calledWith(editor));

    editor.blur();

    stop();
    setTimeout(function() {
      start();
    }, 0);
  });

  test("'focus' event - doesn't bubble up from selectbox when editor already has focus", function() {
    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.$("select").focus();

    ok(!spy.called);

    editor.blur();

    stop();
    setTimeout(function() {
      start();
    }, 0);
  });

  test("'blur' event - bubbles up from selectbox when editor has focus and we're not focusing on another one of the editor's selectboxes", function() {
    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.$("select").first().blur();

    stop();
    setTimeout(function() {
        ok(spy.called);
        ok(spy.calledWith(editor));

        start();
    }, 0);
  });

  test("'blur' event - doesn't bubble up from selectbox when editor has focus and we're focusing on another one of the editor's selectboxes", function() {
    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.$("select:eq(0)").blur();
    editor.$("select:eq(1)").focus();

    stop();
    setTimeout(function() {
      ok(!spy.called);

      editor.blur();

      setTimeout(function() {
        start();
      }, 0);
    }, 0);
  });

  test("'blur' event - doesn't bubble up from selectbox when editor doesn't have focus", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.$("select").blur();

    stop();
    setTimeout(function() {
        ok(!spy.called);

        start();
    }, 0);
  });

})(Backbone.Form, Backbone.Form.editors.Date);
