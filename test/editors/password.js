;(function(Form, Editor) {

  module('Password');

  var same = deepEqual;


  module('Password#initialize');

  test('Sets input type', function() {
    var editor = new Editor();

    same(editor.$el.attr('type'), 'password');
  });

  module('Password#render');

  test('readonly schema adds readonly attribute', function() {
    var editor = new Editor({
      schema: { readonly: true }
    }).render();
    
    same(editor.$el.attr('readonly'), 'readonly');
  });


})(Backbone.Form, Backbone.Form.editors.Password);
