;(function(Form, Editor) {

  module('Hidden');

  var same = deepEqual;


  module('Hidden#initialize');

  test('sets input type', function() {
    var editor = new Editor();

    same(editor.$el.attr('type'), 'hidden');
  });

  test('Default value', function() {
    var editor = new Editor().render();

    equal(editor.getValue(), '');
  });

  test('sets noField property so that the wrapping field is not rendered', function() {
    var editor = new Editor();

    same(editor.noField, true);
  });

})(Backbone.Form, Backbone.Form.editors.Hidden);
