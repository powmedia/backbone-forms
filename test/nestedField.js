;(function(Form, NestedField) {

var same = deepEqual;

module('NestedField#initialize', {
  setup: function() {
    this.sinon = sinon.sandbox.create();
  },

  teardown: function() {
    this.sinon.restore();
  }
});

test('Can override NestedField template', function() {
  var template = _.template('<div class="nested-template"><%= title %></div>');
  var key = 'testing123';

  Form.NestedField.template = template;

  var field = new NestedField({
    key: key,
  }).render();

  same(field.el.outerHTML.toLowerCase(), template({ title: key }));
});


})(Backbone.Form, Backbone.Form.NestedField);
