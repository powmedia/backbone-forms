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


  module('TextArea#render');

  test('readonly schema adds readonly attribute', function() {
    var editor = new Editor({
      schema: { readonly: true }
    }).render();
    
    same(editor.$el.attr('readonly'), 'readonly');
  });


})(Backbone.Form, Backbone.Form.editors.TextArea);
