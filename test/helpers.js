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

})();

module('getValidator');

(function() {

    test('Bundled validator', function() {
        var validator = Form.helpers.getValidator('required');

        equal(validator, Form.validators.required);
    });

    test('Regular Expressions', function() {
        var validator = Form.helpers.getValidator(/hello/);
        var validator2 = Form.helpers.getValidator({'RegExp': 'another'});

        ok(_(validator('hellooooo')).isUndefined());
        ok(validator('bye!'));

        ok(validator2('this is a test'));
        ok(_(validator2('this is another test')).isUndefined());
    });

    test('Function', function () {
        var myValidator = function () { return; };

        var validator = Form.helpers.getValidator(myValidator);

        equal(validator, myValidator);
    });

    test('Unknown', function () {
        raises(function() {
            Form.helpers.getValidator('unknown validator');
        }, /not found/i);
        raises(function() {
            Form.helpers.getValidator(['this is a list', 'not a validator']);
        }, /could not process/i);
    });

})();

