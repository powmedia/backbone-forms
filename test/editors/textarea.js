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


})(Backbone.Form, Backbone.Form.editors.TextArea);
