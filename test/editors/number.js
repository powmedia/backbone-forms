;(function(Form, Editor) {

  module('Number');

  var same = deepEqual;


  test('Default value', function() {
    var editor = new Editor().render();

    same(editor.getValue(), 0);
  });

  test('Null value', function() {
    var editor = new Editor().render();
    editor.setValue(null);

    same(editor.getValue(), null);
  });

  test('Custom value', function() {
    var editor = new Editor({
      value: 100
    }).render();

    same(editor.getValue(), 100);
  });

  test('Value from model', function() {
    var editor = new Editor({
      model: new Backbone.Model({ title: 99 }),
      key: 'title'
    }).render();

    same(editor.getValue(), 99);
  });

  test('Sets input type to "number"', function() {
    var editor = new Editor({
      value: 123
    }).render();

    same(editor.$el.attr('type'), 'number');
  });

  test('Sets step="any" by default', function() {
    var editor = new Editor().render();

    same(editor.$el.attr('step'), 'any');
  });

  test('Allows setting a custom step value', function() {
    var editor = new Editor({
      schema: { editorAttrs: { step: 5 }}
    }).render();

    same(editor.$el.attr('step'), '5');
  });

  test('Allows setting a custom minimum value', function() {
    var editor = new Editor({
      schema: { editorAttrs: { min: 150 }}
    }).render();

    same(editor.$el.attr('min'), '150');
  });

  test("TODO: Restricts non-numeric characters", function() {
    ok(1);
  });

  test("setValue() - updates the input value", function() {
    var editor = new Editor({
      model: new Backbone.Model(),
      key: 'title'
    }).render();

    editor.setValue('2.4');

    same(editor.getValue(), 2.4);
    equal($(editor.el).val(), 2.4);
  });
  test("setValue() - updates the model value", function() {
    var editor = new Editor({
      model: new Backbone.Model(),
      key: 'title'
    }).render();

    editor.setValue('2.4');
    editor.render();

    same(editor.getValue(), 2.4);
    equal($(editor.el).val(), 2.4);
  });

  test('setValue() - handles different types', function() {
    var editor = new Editor().render();

    editor.setValue('123');
    same(editor.getValue(), 123);

    editor.setValue('123.78');
    same(editor.getValue(), 123.78);

    editor.setValue(undefined);
    same(editor.getValue(), null);

    editor.setValue('');
    same(editor.getValue(), null);

    editor.setValue(' ');
    same(editor.getValue(), null);

    //For Firefox
    editor.setValue('heuo46fuek');
    same(editor.getValue(), null);
  });

  test('Uses Backbone.$ not global', function() {
    var old$ = window.$,
      exceptionCaught = false;

    window.$ = null;

    try {
      var editor = new Editor({
        value: 123
      }).render();
    } catch(e) {
      exceptionCaught = true;
    }

    window.$ = old$;

    ok(!exceptionCaught, ' using global \'$\' to render');
  });

  module('Number events', {
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

  test("'change' event - is triggered when value of input changes and is valid", function() {
    var editor = this.editor;

    var callCount = 0;

    var spy = this.sinon.spy();

    editor.on('change', spy);

    // Pressing a valid key
    editor.$el.keypress($.Event("keypress", { charCode: 49 }));
    editor.$el.val('1');

    stop();
    setTimeout(function(){
      callCount++;

      editor.$el.keyup();

      // Pressing an invalid key
      editor.$el.keypress($.Event("keypress", { charCode: 65 }));

      setTimeout(function(){
        editor.$el.keyup();

        // Pressing a valid key
        editor.$el.keypress($.Event("keypress", { charCode: 49 }));
        editor.$el.val('01');

        setTimeout(function(){
          callCount++;

          editor.$el.keyup();

          // Cmd+A; Backspace: Deleting everything
          editor.$el.keyup();
          editor.$el.val('');
          editor.$el.keyup();
          callCount++;

          ok(spy.callCount == callCount);
          ok(spy.alwaysCalledWith(editor));

          start();
        }, 0);
      }, 0);
    }, 0);
  });

  test("'change' event - isn't triggered if the value doesn't change", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('change', spy);

    // Number is 0 by default, pressing 0 again
    editor.$el.keypress($.Event("keypress", { charCode: 48 }));
    editor.$el.val('0');

    stop();
    setTimeout(function(){

      ok(spy.callCount === 0);
      start();

    }, 0);
  });

  test("'change' event - is triggered when clicking the spinner ('input' event)", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('change', spy);

    editor.$el.val('10');
    editor.$el.trigger('input');

    ok(spy.callCount === 1);
  });


})(Backbone.Form, Backbone.Form.editors.Number);
