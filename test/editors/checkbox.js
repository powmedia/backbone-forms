;(function(Form, Editor) {

  module('Checkbox', {
    setup: function() {
      this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
      this.sinon.restore();
    }
  });


  var Model = Backbone.Model.extend({
    schema: {
      enabled: { type: 'Checkbox' }
    }
  });



  test('Default value', function() {
    var editor = new Editor().render();

    deepEqual(editor.getValue(), false);
  });

  test('Custom value', function() {
    var editor = new Editor({
      value: true
    }).render();

    deepEqual(editor.getValue(), true);
  });

  test('Value from model', function() {
    var editor = new Editor({
      model: new Model({ enabled: true }),
      key: 'enabled'
    }).render();

    deepEqual(editor.getValue(), true);
  });

  test('Correct type', function() {
    var editor = new Editor().render();

    deepEqual($(editor.el).get(0).tagName, 'INPUT');
    deepEqual($(editor.el).attr('type'), 'checkbox');
  });

  test("getValue() - returns boolean", function() {
    var editor1 = new Editor({
      value: true
    }).render();

    var editor2 = new Editor({
      value: false
    }).render();

    deepEqual(editor1.getValue(), true);
    deepEqual(editor2.getValue(), false);
  });

  test("setValue() - updates the input value", function() {
    var editor = new Editor({
      model: new Model,
      key: 'enabled'
    }).render();

    editor.setValue(true);

    deepEqual(editor.getValue(), true);
    deepEqual($(editor.el).prop('checked'), true);
  });



  module('Checkbox events', {
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

  test("focus() - gives focus to editor and its checkbox", function() {
    var editor = this.editor;

    editor.focus();

    ok(editor.hasFocus);
    ok(editor.$el.is(':focus'));
  });

  test("focus() - triggers the 'focus' event", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.focus();

    ok(spy.called);
    ok(spy.calledWith(editor));
  });

  test("blur() - removes focus from the editor and its checkbox", function() {
    var editor = this.editor;

    editor.focus();

    editor.blur();

    ok(!editor.hasFocus);
    ok(!editor.$el.is(':focus'));
  });

  test("blur() - triggers the 'blur' event", function() {
    var editor = this.editor;

    editor.focus()

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.blur();

    ok(spy.called);
    ok(spy.calledWith(editor));
  });

  test("'change' event - is triggered when the checkbox is clicked", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('change', spy);

    editor.$el.click();

    ok(spy.calledOnce);
    ok(spy.alwaysCalledWith(editor));
  });

  test("'focus' event - bubbles up from the checkbox", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.$el.focus();

    ok(spy.calledOnce);
    ok(spy.alwaysCalledWith(editor));
  });

  test("'blur' event - bubbles up from the checkbox", function() {
    var editor = this.editor;

    editor.$el.focus();

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.$el.blur();

    ok(spy.calledOnce);
    ok(spy.alwaysCalledWith(editor));
  });

})(Backbone.Form, Backbone.Form.editors.Checkbox);
