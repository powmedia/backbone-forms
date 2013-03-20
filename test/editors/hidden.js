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

})(Backbone.Form, Backbone.Form.editors.Hidden);
