module('keyToTitle');

test('Transforms camelCased string to words', function() {
    var fn = Form.helpers.keyToTitle;
    
    equal(fn('test'), 'Test');
    equal(fn('camelCasedString'), 'Camel Cased String');
});



module('createTemplate');

test('todo', function() {
    console.log('TODO')
});



module('createEditor');

(function() {
    
    var create = Form.helpers.createEditor,
        editors = Form.editors;

    var options = {
        key: 'test',
        schema: {
            subSchema: {
                key: 'test'
            },
            model: 'test',
            options: []
        }
    };    
    
    test('Accepts strings for included editors', function() {
        ok(create('Text', options) instanceof editors.Text);
        ok(create('Number', options) instanceof editors.Number);
        ok(create('TextArea', options) instanceof editors.TextArea);
        ok(create('Password', options) instanceof editors.Password);
        ok(create('Select', options) instanceof editors.Select);
        ok(create('Object', options) instanceof editors.Object);
        ok(create('NestedModel', options) instanceof editors.NestedModel);
    });

    test('Accepts editor constructors', function() {
        ok(create(editors.Text, options) instanceof editors.Text);
        ok(create(editors.Select, options) instanceof editors.Select);
    });
    
})();



module('triggerCancellableEvent');

(function() {
    
    var trigger = Form.helpers.triggerCancellableEvent;
    
    test('Passes through arguments', function() {
        expect(2);
        
        var view = new Backbone.View();

        view.bind('add', function(arg1, arg2, next) {
            equal(arg1, 'foo');
            equal(arg2, 'bar');
        });

        trigger(view, 'add', ['foo', 'bar']);
    });
    
    test('Default action runs if next is called', function() {
        expect(1);
        
        var view = new Backbone.View();
        
        view.bind('remove', function(next) {
            next();
        });
        
        trigger(view, 'remove', [], function() {
            ok(true);
        });
    });

    test('Default action doesnt run if next is not called', function() {
        var view = new Backbone.View();
        
        view.bind('edit', function(next) {
            //Don't continue
        });
        
        trigger(view, 'edit', [], function() {
            ok(false); //Shouldn't run
        });
    });

    test('Default action run without anything bound', function() {
        expect(1);

        var view = new Backbone.View();

        trigger(view, 'remove', [], function() {
            ok(true);
        });
    });

})();
