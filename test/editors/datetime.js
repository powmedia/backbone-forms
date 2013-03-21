;(function(Form, Editor) {

  module('DateTime', {
    setup: function() {
      this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
      this.sinon.restore();
    }
  });

  var same = deepEqual;

  var DateEditor = Form.editors.Date;

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
    this.sinon.spy(Form.editors.Base.prototype, 'remove');

    var editor = new Editor().render();

    editor.remove();

    ok(DateEditor.prototype.remove.calledOnce);
    ok(Form.editors.Base.prototype.remove.calledOnce);
  });



  module('DateTime events', {
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

})(Backbone.Form, Backbone.Form.editors.DateTime);
