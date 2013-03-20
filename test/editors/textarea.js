;(function(Form, Editor) {

  module('TextArea');

  var same = deepEqual;


  module('TextArea#initialize');

  test('sets tag type', function() {
    var editor = new Editor();

    ok(editor.$el.is('textarea'));
  });


})(Backbone.Form, Backbone.Form.editors.TextArea);
