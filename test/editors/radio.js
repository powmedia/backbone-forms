;(function(Form, Editor) {

  module('Radio', {
    setup: function() {
      this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
      this.sinon.restore();
    }
  });


  var schema = {
    options: ['Sterling', 'Lana', 'Cyril', 'Cheryl', 'Pam']
  };



  test('Options as array of objects', function() {
    var editor = new Editor({
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

    var radios = editor.$el.find("input[type=radio]");
    var labels = editor.$el.find("label");

    equal(radios.length, 3);
    equal(radios.length, labels.length);

    equal(labels.first().html(), "Option 1");
    equal(labels.last().html(), "Option 3");

    equal(radios.first().val(), "0");
    equal(radios.last().val(), "2");
  });

  test('Default value', function() {
    var editor = new Editor({
      schema: schema
    }).render();

    equal(editor.getValue(), undefined);
  });

  test('Custom value', function() {
    var editor = new Editor({
      value: 'Cyril',
      schema: schema
    }).render();

    equal(editor.getValue(), 'Cyril');
  });

  test('Throws errors if no options', function () {
    raises(function () {
      var editor = new Editor({schema: {}});
    }, /^Missing required/, 'ERROR: Accepted a new Radio editor with no options.');
  });

  test('Value from model', function() {
    var editor = new Editor({
      model: new Backbone.Model({ name: 'Lana' }),
      key: 'name',
      schema: schema
    }).render();
    equal(editor.getValue(), 'Lana');
  });

  test('Correct type', function() {
    var editor = new Editor({
      schema: schema
    }).render();
    equal($(editor.el).get(0).tagName, 'UL');
    notEqual($(editor.el).find('input[type=radio]').length, 0);
  });



  module('Radio events', {
    setup: function() {
      this.sinon = sinon.sandbox.create();

      this.editor = new Editor({
        schema: schema
      }).render();

      $('body').append(this.editor.el);
    },

    teardown: function() {
      this.sinon.restore();

      this.editor.remove();
    }
  });

  test("focus() - gives focus to editor and its first radiobutton when no radiobutton is checked", function() {
    var editor = this.editor;

    editor.focus();

    ok(editor.hasFocus);
    ok(editor.$('input[type=radio]').first().is(':focus'));

    editor.blur();

    stop();
    setTimeout(function() {
      start();
    }, 0);
  });

  test("focus() - gives focus to editor and its checked radiobutton when a radiobutton is checked", function() {
    var editor = this.editor;

    editor.$('input[type=radio]').val([editor.$('input[type=radio]').eq(1).val()]);

    editor.focus();

    ok(editor.hasFocus);
    ok(editor.$('input[type=radio]').eq(1).is(':focus'));

    editor.$('input[type=radio]').val([null]);

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

  test("blur() - removes focus from the editor and its focused radiobutton", function() {
    var editor = this.editor;

    editor.focus();

    editor.blur();

    stop();
    setTimeout(function() {
      ok(!editor.hasFocus);
      ok(!editor.$('input[type=radio]').first().is(':focus'));

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

  test("'change' event - is triggered when a non-checked radiobutton is clicked", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('change', spy);

    editor.$("input[type=radio]:not(:checked)").first().click();

    ok(spy.called);
    ok(spy.calledWith(editor));

    editor.$("input[type=radio]").val([null]);
  });

  test("'focus' event - bubbles up from radiobutton when editor doesn't have focus", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.$("input[type=radio]").first().focus();

    ok(spy.called);
    ok(spy.calledWith(editor));

    editor.blur();

    stop();
    setTimeout(function() {
      start();
    }, 0);
  });

  test("'focus' event - doesn't bubble up from radiobutton when editor already has focus", function() {
    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.$("input[type=radio]").focus();

    ok(!spy.called);

    editor.blur();

    stop();
    setTimeout(function() {
      start();
    }, 0);
  });

  test("'blur' event - bubbles up from radiobutton when editor has focus and we're not focusing on another one of the editor's radiobuttons", function() {
    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.$("input[type=radio]").first().blur();

    stop();
    setTimeout(function() {
        ok(spy.called);
        ok(spy.calledWith(editor));

        start();
    }, 0);
  });

  test("'blur' event - doesn't bubble up from radiobutton when editor has focus and we're focusing on another one of the editor's radiobuttons", function() {
    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.$("input[type=radio]:eq(0)").blur();
    editor.$("input[type=radio]:eq(1)").focus();

    stop();
    setTimeout(function() {
      ok(!spy.called);

      editor.blur();

      setTimeout(function() {
        start();
      }, 0);
    }, 0);
  });

  test("'blur' event - doesn't bubble up from radiobutton when editor doesn't have focus", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.$("input[type=radio]").blur();

    stop();
    setTimeout(function() {
      ok(!spy.called);

      start();
    }, 0);
  });

})(Backbone.Form, Backbone.Form.editors.Radio);
