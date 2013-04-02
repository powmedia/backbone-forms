;(function(Form, Editor) {

  module('NestedModel');


  var same = deepEqual;

  var ChildModel = Backbone.Model.extend({
    schema: {
      id: { type: 'Number' },
      name: {}
    },
    defaults: {
      id: 8,
      name: 'Marklar'
    }
  });

  var schema = { model: ChildModel };



  test('Default value', function() {
    var editor = new Editor({
      form: new Form(),
      schema: schema
    }).render();

    deepEqual(editor.getValue(), { id: 8, name: 'Marklar' });
  });

  test('Custom value', function() {
    var editor = new Editor({
      form: new Form(),
      schema: schema,
      value: {
        id: 42,
        name: "Krieger"
      }
    }).render();

    deepEqual(editor.getValue(), { id: 42, name: "Krieger" });
  });

  test('Custom value overrides default value (issue #99)', function() {
    var Person = Backbone.Model.extend({
      schema: { firstName: 'Text', lastName: 'Text' },
      defaults: { firstName: '', lastName: '' }
    });

    var Duo = Backbone.Model.extend({
      schema: {
        name: { type: 'Text' },
        hero: { type: 'NestedModel', model: Person },
        sidekick: { type: 'NestedModel', model: Person}
      }
    });

    var batman = new Person({ firstName: 'Bruce', lastName: 'Wayne' });
    var robin = new Person({ firstName: 'Dick', lastName: 'Grayson' });

    var duo = new Duo({
      name: "The Dynamic Duo",
      hero: batman,
      sidekick: robin
    });

    var duoForm = new Backbone.Form({ model: duo }).render();
    var batmanForm = new Backbone.Form({ model: batman }).render();

    same(duoForm.getValue().hero, {
      firstName: 'Bruce',
      lastName: 'Wayne'
    });
  });

  test('Value from model', function() {
    var agency = new Backbone.Model({
      spy: {
        id: 28,
        name: 'Pam'
      }
    });

    var editor = new Editor({
      form: new Form(),
      schema: schema,
      model: agency,
      key: 'spy'
    }).render();

    deepEqual(editor.getValue(), { id: 28, name: 'Pam' });
  });

  test("TODO: idPrefix is added to child form elements", function() {
    ok(1);
  });

  test("TODO: Validation on nested model", function() {
    ok(1);
  });

  test('TODO: uses the nestededitor template, unless overridden in editor schema', function() {
    ok(1);
  });

  test("TODO: remove() - Removes embedded form", function() {
    ok(1);
  });

  test("setValue() - updates the input value", function() {
    var agency = new Backbone.Model({
      spy: {
        id: 28,
        name: 'Pam'
      }
    });

    var editor = new Editor({
      form: new Form(),
      schema: schema,
      model: agency,
      key: 'spy'
    }).render();

    var newValue = {
      id: 89,
      name: "Sterling"
    };

    editor.setValue(newValue);

    deepEqual(editor.getValue(), newValue);
  });

})(Backbone.Form, Backbone.Form.editors.NestedModel);
