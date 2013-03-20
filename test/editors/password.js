;(function(Form, Editor) {

  module('Password');

  var same = deepEqual;


  module('Password#initialize');

  test('Sets input type', function() {
    var editor = new Editor();

    same(editor.$el.attr('type'), 'password');
  });


})(Backbone.Form, Backbone.Form.editors.Password);
