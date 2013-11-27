;(function(Form, Editor) {

  module('Email');

  var same = deepEqual;


  module('Email#initialize');

  test('sets type attribute to email', function() {
    var editor = new Editor();

    same(editor.$el.attr('type'), 'email');
  });

})(Backbone.Form, Backbone.Form.editors.Email);
