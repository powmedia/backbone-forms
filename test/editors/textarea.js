;(function(Form, Editor) {

  module('TextArea');

  var same = deepEqual;


  module('TextArea#initialize');

  test('sets tag type', function() {
    var editor = new Editor();

    ok(editor.$el.is('textarea'));
  });

  test('does not set type attribute', function() {
    var editor = new Editor();

    same(editor.$el.attr('type'), undefined);
  });


  test('Uses Backbone.$ not global', function() {
    var old$ = window.$,
      exceptionCaught = false;

    window.$ = null;

    try {
      var editor = new Editor({
        value: 'Test'
      }).render();
    } catch(e) {
      exceptionCaught = true;
    }

    window.$ = old$;

    ok(!exceptionCaught, ' using global \'$\' to render');
  });


})(Backbone.Form, Backbone.Form.editors.TextArea);
