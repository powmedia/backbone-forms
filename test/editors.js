module('Base');

    test('commit()', function() {
        var post = new Post;
    
        var field = new editors.TextField({
            model: post,
            key: 'title'
        }).render();
    
        //Change value
        $(field.el).val('New Title');
    
        field.commit();
    
        equal(post.get('title'), 'New Title');
    });
    
    test('TODO: Test commit() validation failure', function() {
        
    });




module('TextField');

(function() {
    
    var editor = editors.TextField;
    
    test('Default value', function() {
        var field = new editor().render();

        equal(field.getValue(), '');
    });

    test('Custom value', function() {
        var field = new editor({
            value: 'Test'
        }).render();

        equal(field.getValue(), 'Test');
    });

    test('Value from model', function() {
        var field = new editor({
            model: new Post,
            key: 'title'
        }).render();
        
        equal(field.getValue(), 'Danger Zone!');
    });

})();




module('Number');

(function() {
    
    var editor = editors.Number;
    
    test('Default value', function() {
        var field = new editor().render();

        deepEqual(field.getValue(), 0);
    });

    test('Custom value', function() {
        var field = new editor({
            value: 100
        }).render();

        deepEqual(field.getValue(), 100);
    });

    test('Value from model', function() {
        var field = new editor({
            model: new Post({ title: 99 }),
            key: 'title'
        }).render();
        
        deepEqual(field.getValue(), 99);
    });
    
    test("TODO: Restricts non-numeric characters", function() {
        console.log('TODO')
    });

})();




module('Password');

(function() {
    
    var editor = editors.Password;
    
    test('Default value', function() {
        var field = new editor().render();

        equal(field.getValue(), '');
    });

    test('Custom value', function() {
        var field = new editor({
            value: 'Test'
        }).render();

        equal(field.getValue(), '');
    });

    test('Value from model', function() {
        var field = new editor({
            model: new Post,
            key: 'title'
        }).render();
        
        equal(field.getValue(), '');
    });
    
    test('Correct type', function() {
        var field = new editor().render();
        
        equal($(field.el).attr('type'), 'password');
    });

})();




module('TextArea');

(function() {
    
    var editor = editors.TextArea;
    
    test('Default value', function() {
        var field = new editor().render();

        equal(field.getValue(), '');
    });

    test('Custom value', function() {
        var field = new editor({
            value: 'Test'
        }).render();

        equal(field.getValue(), 'Test');
    });

    test('Value from model', function() {
        var field = new editor({
            model: new Post,
            key: 'title'
        }).render();
        
        equal(field.getValue(), 'Danger Zone!');
    });
    
    test('Correct type', function() {
        var field = new editor().render();
        
        equal($(field.el).get(0).tagName, 'TEXTAREA');
    });

})();




module('Select');

(function() {
    
    var editor = editors.Select,
        schema = {
            options: ['Sterling', 'Lana', 'Cyril', 'Cheryl', 'Pam']
        };
    
    test('Default value', function() {
        var field = new editor({
            schema: schema
        }).render();

        equal(field.getValue(), 'Sterling');
    });

    test('Custom value', function() {
        var field = new editor({
            value: 'Cyril',
            schema: schema
        }).render();

        equal(field.getValue(), 'Cyril');
    });

    test('Value from model', function() {
        var field = new editor({
            model: new Backbone.Model({ name: 'Lana' }),
            key: 'name',
            schema: schema
        }).render();
        
        equal(field.getValue(), 'Lana');
    });
    
    test('Correct type', function() {
        var field = new editor({
            schema: schema
        }).render();
        
        equal($(field.el).get(0).tagName, 'SELECT');
    });
    
    test('TODO: Options as array of items', function() {
        console.log('TODO')
    });
    
    test('TODO: Options as array of objects', function() {
        console.log('TODO')
    });

    test('TODO: Options as function that calls back with options', function() {
        console.log('TODO')
    });

    test('TODO: Options as string of HTML', function() {
        console.log('TODO')
    });

    test('TODO: Options as a pre-populated collection', function() {
        console.log('TODO')
    });
    
    test('TODO: Options as a new collection (needs to be fetched)', function() {
        console.log('TODO')
    });

})();




module('Object');

(function() {
    
    var editor = editors.Object,
        schema = {
            subSchema: {
                id: { type: 'Number' },
                name: { }
            }
        };
    
    test('Default value', function() {
        var field = new editor({
            schema: schema
        }).render();
        
        deepEqual(field.getValue(), { id: 0, name: '' });
    });

    test('Custom value', function() {
        var field = new editor({
            schema: schema,
            value: {
                id: 42,
                name: "Krieger"
            }
        }).render();

        deepEqual(field.getValue(), { id: 42, name: "Krieger" });
    });

    test('Value from model', function() {
        var agency = new Backbone.Model({
            spy: {
                id: 28,
                name: 'Pam'
            }
        });
        
        var field = new editor({
            schema: schema,
            model: agency,
            key: 'spy'
        }).render();
        
        deepEqual(field.getValue(), { id: 28, name: 'Pam' });
    });
    
    test("TODO: idPrefix is added to child form elements", function() {
        console.log('TODO')
    });

})();




module('NestedModel');

(function() {
    
    var ChildModel = Backbone.Model.extend({
        schema: {
            id: { type: 'Number' },
            name: {}
        }
    });
    
    var editor = editors.NestedModel,
        schema = { model: ChildModel };
    
    test('Default value', function() {
        /*
        var field = new editor({
            schema: schema
        }).render();
        
        deepEqual(field.getValue(), { id: 0, name: '' });
        */
        console.log('TODO');
    });

    test('Custom value', function() {
        var field = new editor({
            schema: schema,
            value: {
                id: 42,
                name: "Krieger"
            }
        }).render();

        deepEqual(field.getValue(), { id: 42, name: "Krieger" });
    });

    test('Value from model', function() {
        var agency = new Backbone.Model({
            spy: {
                id: 28,
                name: 'Pam'
            }
        });
        
        var field = new editor({
            schema: schema,
            model: agency,
            key: 'spy'
        }).render();
        
        deepEqual(field.getValue(), { id: 28, name: 'Pam' });
    });
    
    test("TODO: idPrefix is added to child form elements", function() {
        console.log('TODO')
    });
    
    test("TODO: Validation on nested model", function() {
        console.log('TODO')
    })

})();
