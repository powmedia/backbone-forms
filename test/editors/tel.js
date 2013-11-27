;(function(Form, Editor) {

  module('Tel');

  var same = deepEqual;


  module('Tel#initialize');

  test('sets type attribute to tel', function() {
    var editor = new Editor();
    same(editor.$el.attr('type'), 'tel');
  });

})(Backbone.Form, Backbone.Form.editors.Tel);
