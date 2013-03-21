;(function(Form, Editor) {

  module('Object', {
    setup: function() {
        this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
        this.sinon.restore();
    }
  });


  var schema = {
    subSchema: {
      id: { type: 'Number' },
      name: { }
    }
  };



  test('Default value', function() {
    var editor = new Editor({
      form: new Form(),
      schema: schema
    }).render();

    deepEqual(editor.getValue(), { id: 0, name: '' });
  });

  test('Custom value', function() {
    var editor = new Editor({
      form: new Form(),
      schema: schema,
      value: {
        id: 42,
        name: "Krieger"
      }
    }).render();

    deepEqual(editor.getValue(), { id: 42, name: "Krieger" });
  });

  test('Value from model', function() {
    var agency = new Backbone.Model({
      spy: {
        id: 28,
        name: 'Pam'
      }
    });

    var editor = new Editor({
      form: new Form(),
      schema: schema,
      model: agency,
      key: 'spy'
    }).render();

    deepEqual(editor.getValue(), { id: 28, name: 'Pam' });
  });

  test("TODO: idPrefix is added to child form elements", function() {
    ok(1);
  });

  test("TODO: remove() - Removes embedded form", function() {
    ok(1);
  });

  test('TODO: uses the nestededitor template, unless overridden in editor schema', function() {
    ok(1);
  });

  test("setValue() - updates the input value", function() {
    var editor = new Editor({
      form: new Form(),
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

    editor.setValue(newValue);

    deepEqual(editor.getValue(), newValue);
  });

  test('validate() - returns validation errors', function() {
    var schema = {};
    schema.subSchema = {
      id:     { validators: ['required'] },
      name:   {},
      email:  { validators: ['email'] }
    }

    var editor = new Editor({
      form: new Form(),
      schema: schema,
      value: {
        id: null,
        email: 'invalid'
      }
    }).render();

    var errs = editor.validate();

    equal(errs.id.type, 'required');
    equal(errs.email.type, 'email');
  });



  module('Object events', {
    setup: function() {
      this.sinon = sinon.sandbox.create();

      this.editor = new Editor({
        form: new Form(),
        schema: schema
      }).render();

      $('body').append(this.editor.el);
    },

    teardown: function() {
      this.sinon.restore();

      this.editor.remove();
    }
  });

  test("focus() - gives focus to editor and its form", function() {
    var editor = this.editor;

    editor.focus();

    ok(editor.hasFocus);
    ok(editor.nestedForm.hasFocus);
  });

  test("focus() - triggers the 'focus' event", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.focus();

    ok(spy.called);
    ok(spy.calledWith(editor));
  });

  test("blur() - removes focus from the editor and its form", function() {
    var editor = this.editor;

    editor.focus();

    editor.blur();

    stop();
    setTimeout(function() {
      ok(!editor.hasFocus);
      ok(!editor.nestedForm.hasFocus);

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

  test("'change' event - bubbles up from the form", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('change', spy);

    editor.nestedForm.trigger('change', editor.nestedForm);

    ok(spy.called);
    ok(spy.calledWith(editor));
  });

  test("'focus' event - bubbles up from the form when editor doesn't have focus", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.nestedForm.focus();

    ok(spy.called);
    ok(spy.calledWith(editor));
  });

  test("'focus' event - doesn't bubble up from the editor when editor already has focus", function() {
    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.nestedForm.focus();

    ok(!spy.called);
  });

  test("'blur' event - bubbles up from the form when editor has focus", function() {
    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.nestedForm.blur();

    stop();
    setTimeout(function() {
      ok(spy.called);
      ok(spy.calledWith(editor));

      start();
    }, 0);
  });

  test("'blur' event - doesn't bubble up from the form when editor doesn't have focus", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.nestedForm.blur();

    stop();
    setTimeout(function() {
      ok(!spy.called);

      start();
    }, 0);
  });

  test("Events bubbling up from the form", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('whatever', spy);

    editor.nestedForm.trigger('whatever', editor.nestedForm);

    ok(spy.called);
    ok(spy.calledWith(editor));
  });

})(Backbone.Form, Backbone.Form.editors.Object);
