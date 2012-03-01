(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['Backbone.Form','Post'], factory);
    } else {
        // RequireJS isn't being used. Assume backbone is loaded in <script> tags
        factory(Backbone,Post);
    }
}(function (Backbone, Post) {
    var Form = Backbone.Form,
        Field = Form.Field,
        editors = Form.editors;
    module('Base');

    test('commit() - returns validation errors', function () {
        var editor = new editors.Text({
            model:new Post,
            key:'title',
            validators:['required']
        }).render();

        editor.setValue(null);

        var err = editor.commit();

        equal(err.type, 'required');
        equal(err.message, 'Required');
    });

    test('commit() - sets value to model', function () {
        var post = new Post;

        var editor = new editors.Text({
            model:post,
            key:'title'
        }).render();

        //Change value
        editor.setValue('New Title');

        editor.commit();

        equal(post.get('title'), 'New Title');
    });

    test('commit() - returns model validation errors', function () {
        var post = new Post;

        post.validate = function () {
            return 'ERROR';
        };

        var editor = new editors.Text({
            model:post,
            key:'title'
        }).render();

        var err = editor.commit();

        equal(err, 'ERROR');
    });

    test('validate() - returns validation errors', function () {
        var editor = new editors.Text({
            key:'title',
            validators:['required']
        });

        ok(editor.validate());

        editor.setValue('a value');

        ok(_(editor.validate()).isUndefined());
    });


    module('Text');

    (function () {

        var editor = editors.Text;

        test('getValue() - Default value', function () {
            var field = new editor().render();

            equal(field.getValue(), '');
        });

        test('getValue() - Custom value', function () {
            var field = new editor({
                value:'Test'
            }).render();

            equal(field.getValue(), 'Test');
        });

        test('getValue() - Value from model', function () {
            var field = new editor({
                model:new Post,
                key:'title'
            }).render();

            equal(field.getValue(), 'Danger Zone!');
        });

        test("setValue() - updates the input value", function () {
            var field = new editor({
                model:new Post,
                key:'title'
            }).render();

            field.setValue('foobar');

            equal(field.getValue(), 'foobar');
            equal($(field.el).val(), 'foobar');
        });

        test('Default type is text', function () {
            var field = new editor().render();

            equal($(field.el).attr('type'), 'text');
        });

        test('Type can be changed', function () {
            var field = new editor({
                schema:{ dataType:'tel' }
            }).render();

            equal($(field.el).attr('type'), 'tel');
        });

    })();


    module('Number');

    (function () {

        var editor = editors.Number;

        test('Default value', function () {
            var field = new editor().render();

            deepEqual(field.getValue(), 0);
        });

        test('Null value', function () {
            var field = new editor().render();
            field.setValue(null);

            deepEqual(field.getValue(), null);
        });

        test('Custom value', function () {
            var field = new editor({
                value:100
            }).render();

            deepEqual(field.getValue(), 100);
        });

        test('Value from model', function () {
            var field = new editor({
                model:new Post({ title:99 }),
                key:'title'
            }).render();

            deepEqual(field.getValue(), 99);
        });

        test("TODO: Restricts non-numeric characters", function () {
            console.log('TODO')
        });

        test("setValue() - updates the input value", function () {
            var field = new editor({
                model:new Post,
                key:'title'
            }).render();

            field.setValue('2.4');

            deepEqual(field.getValue(), 2.4);
            equal($(field.el).val(), 2.4);
        });

    })();


    module('Password');

    (function () {

        var editor = editors.Password;

        test('Default value', function () {
            var field = new editor().render();

            equal(field.getValue(), '');
        });

        test('Custom value', function () {
            var field = new editor({
                value:'Test'
            }).render();

            equal(field.getValue(), 'Test');
        });

        test('Value from model', function () {
            var field = new editor({
                model:new Post,
                key:'title'
            }).render();

            equal(field.getValue(), 'Danger Zone!');
        });

        test('Correct type', function () {
            var field = new editor().render();

            equal($(field.el).attr('type'), 'password');
        });

        test("setValue() - updates the input value", function () {
            var field = new editor({
                model:new Post,
                key:'title'
            }).render();

            field.setValue('foobar');

            equal(field.getValue(), 'foobar');
            equal($(field.el).val(), 'foobar');
        });

    })();


    module('TextArea');

    (function () {

        var editor = editors.TextArea;

        test('Default value', function () {
            var field = new editor().render();

            equal(field.getValue(), '');
        });

        test('Custom value', function () {
            var field = new editor({
                value:'Test'
            }).render();

            equal(field.getValue(), 'Test');
        });

        test('Value from model', function () {
            var field = new editor({
                model:new Post,
                key:'title'
            }).render();

            equal(field.getValue(), 'Danger Zone!');
        });

        test('Correct type', function () {
            var field = new editor().render();

            equal($(field.el).get(0).tagName, 'TEXTAREA');
        });

        test("setValue() - updates the input value", function () {
            var field = new editor({
                model:new Post,
                key:'title'
            }).render();

            field.setValue('foobar');

            equal(field.getValue(), 'foobar');
            equal($(field.el).val(), 'foobar');
        });

    })();


    module('checkbox');

    (function () {

        var editor = editors.Checkbox;

        var Model = Backbone.Model.extend({
            schema:{
                enabled:{ type:'Checkbox' }
            }
        });

        test('Default value', function () {
            var field = new editor().render();

            deepEqual(field.getValue(), false);
        });

        test('Custom value', function () {
            var field = new editor({
                value:true
            }).render();

            deepEqual(field.getValue(), true);
        });

        test('Value from model', function () {
            var field = new editor({
                model:new Model({ enabled:true }),
                key:'enabled'
            }).render();

            deepEqual(field.getValue(), true);
        });

        test('Correct type', function () {
            var field = new editor().render();

            deepEqual($(field.el).get(0).tagName, 'INPUT');
            deepEqual($(field.el).attr('type'), 'checkbox');
        });

        test("getValue() - returns boolean", function () {
            var field1 = new editor({
                value:true
            }).render();

            var field2 = new editor({
                value:false
            }).render();

            deepEqual(field1.getValue(), true);
            deepEqual(field2.getValue(), false);
        });

        test("setValue() - updates the input value", function () {
            var field = new editor({
                model:new Model,
                key:'enabled'
            }).render();

            field.setValue(true);

            deepEqual(field.getValue(), true);
            deepEqual($(field.el).attr('checked'), 'checked');
        });

    })();


    module('Hidden');

    (function () {

        var editor = editors.Hidden;

        test('Default value', function () {
            var field = new editor().render();

            equal(field.getValue(), '');
        });

        test('Custom value', function () {
            var field = new editor({
                value:'Test'
            }).render();

            equal(field.getValue(), 'Test');
        });

        test('Value from model', function () {
            var field = new editor({
                model:new Post,
                key:'title'
            }).render();

            equal(field.getValue(), 'Danger Zone!');
        });

        test('Correct type', function () {
            var field = new editor().render();

            equal($(field.el).attr('type'), 'hidden');
        });

        test("setValue() - updates the field value", function () {
            var field = new editor({
                model:new Post,
                key:'title'
            }).render();

            field.setValue('foobar');

            equal(field.getValue(), 'foobar');
        });

    })();


    module('Select');

    (function () {

        var editor = editors.Select,
            schema = {
                options:['Sterling', 'Lana', 'Cyril', 'Cheryl', 'Pam']
            };

        test('Default value', function () {
            var field = new editor({
                schema:schema
            }).render();

            equal(field.getValue(), 'Sterling');
        });

        test('Custom value', function () {
            var field = new editor({
                value:'Cyril',
                schema:schema
            }).render();

            equal(field.getValue(), 'Cyril');
        });

        test('Value from model', function () {
            var field = new editor({
                model:new Backbone.Model({ name:'Lana' }),
                key:'name',
                schema:schema
            }).render();

            equal(field.getValue(), 'Lana');
        });

        test('Correct type', function () {
            var field = new editor({
                schema:schema
            }).render();

            equal($(field.el).get(0).tagName, 'SELECT');
        });

        test('TODO: Options as array of items', function () {
            console.log('TODO')
        });

        test('TODO: Options as array of objects', function () {
            console.log('TODO')
        });

        test('TODO: Options as function that calls back with options', function () {
            console.log('TODO')
        });

        test('TODO: Options as string of HTML', function () {
            console.log('TODO')
        });

        test('TODO: Options as a pre-populated collection', function () {
            console.log('TODO')
        });

        test('TODO: Options as a new collection (needs to be fetched)', function () {
            console.log('TODO')
        });

        test("setValue() - updates the input value", function () {
            var field = new editor({
                value:'Pam',
                schema:schema
            }).render();

            field.setValue('Lana');

            equal(field.getValue(), 'Lana');
            equal($(field.el).val(), 'Lana');
        });

    })();


    module('Radio');

    (function () {
        var editor = editors.Radio,
            schema = {
                options:['Sterling', 'Lana', 'Cyril', 'Cheryl', 'Pam']
            };

        test('Default value', function () {
            var field = new editor({
                schema:schema
            }).render();

            equal(field.getValue(), undefined);
        });

        test('Custom value', function () {
            var field = new editor({
                value:'Cyril',
                schema:schema
            }).render();

            equal(field.getValue(), 'Cyril');
        });

        test('Throws errors if no options', function () {
            raises(function () {
                var field = new editor({schema:{}});
            }, /^Missing required/, 'ERROR: Accepted a new Radio editor with no options.');
        });

        test('Value from model', function () {
            var field = new editor({
                model:new Backbone.Model({ name:'Lana' }),
                key:'name',
                schema:schema
            }).render();
            equal(field.getValue(), 'Lana');
        });

        test('Correct type', function () {
            var field = new editor({
                schema:schema
            }).render();
            equal($(field.el).get(0).tagName, 'UL');
            notEqual($(field.el).find('input[type=radio]').length, 0);
        });

    })();


    module('Checkboxes');

    (function () {
        var editor = editors.Checkboxes,
            schema = {
                options:['Sterling', 'Lana', 'Cyril', 'Cheryl', 'Pam', 'Doctor Krieger']
            };

        test('Default value', function () {
            var field = new editor({
                schema:schema
            }).render();

            var value = field.getValue();
            equal(_.isEqual(value, []), true);
        });

        test('Custom value', function () {
            var field = new editor({
                value:['Cyril'],
                schema:schema
            }).render();

            var value = field.getValue();
            var expected = ['Cyril'];
            equal(_.isEqual(expected, value), true);
        });

        test('Throws errors if no options', function () {
            raises(function () {
                var field = new editor({schema:{}});
            }, /^Missing required/, 'ERROR: Accepted a new Checkboxes editor with no options.');
        });

        // Value from model doesn't work here as the value must be an array.

        test('Correct type', function () {
            var field = new editor({
                schema:schema
            }).render();
            equal($(field.el).get(0).tagName, 'UL');
            notEqual($(field.el).find('input[type=checkbox]').length, 0);
        });

        test('setting value with one item', function () {
            var field = new editor({
                schema:schema
            }).render();

            field.setValue(['Lana']);

            deepEqual(field.getValue(), ['Lana']);
            equal($(field.el).find('input[type=checkbox]:checked').length, 1);
        });

        test('setting value with multiple items, including a value with a space', function () {
            var field = new editor({
                schema:schema
            }).render();

            field.setValue(['Lana', 'Doctor Krieger']);

            deepEqual(field.getValue(), ['Lana', 'Doctor Krieger']);
            equal($(field.el).find('input[type=checkbox]:checked').length, 2);
        });

    })();


    module('Object');

    (function () {

        var editor = editors.Object,
            schema = {
                subSchema:{
                    id:{ type:'Number' },
                    name:{ }
                }
            };

        test('Default value', function () {
            var field = new editor({
                schema:schema
            }).render();

            deepEqual(field.getValue(), { id:0, name:'' });
        });

        test('Custom value', function () {
            var field = new editor({
                schema:schema,
                value:{
                    id:42,
                    name:"Krieger"
                }
            }).render();

            deepEqual(field.getValue(), { id:42, name:"Krieger" });
        });

        test('Value from model', function () {
            var agency = new Backbone.Model({
                spy:{
                    id:28,
                    name:'Pam'
                }
            });

            var field = new editor({
                schema:schema,
                model:agency,
                key:'spy'
            }).render();

            deepEqual(field.getValue(), { id:28, name:'Pam' });
        });

        test("TODO: idPrefix is added to child form elements", function () {
            console.log('TODO')
        });

        test("TODO: remove() - Removes embedded form", function () {
            console.log('TODO')
        });

        test("setValue() - updates the input value", function () {
            var field = new editor({
                schema:schema,
                value:{
                    id:42,
                    name:"Krieger"
                }
            }).render();

            var newValue = {
                id:89,
                name:"Sterling"
            };

            field.setValue(newValue);

            deepEqual(field.getValue(), newValue);
        });

        test('validate() - returns validation errors', function () {
            var schema = {};
            schema.subSchema = {
                id:{ validators:['required'] },
                name:{},
                email:{ validators:['email'] }
            }

            var field = new editor({
                schema:schema,
                value:{
                    id:null,
                    email:'invalid'
                }
            }).render();

            var errs = field.validate();

            equal(errs.id.type, 'required');
            equal(errs.email.type, 'email');
        });

    })();


    module('NestedModel');

    (function () {

        var ChildModel = Backbone.Model.extend({
            schema:{
                id:{ type:'Number' },
                name:{}
            }
        });

        var editor = editors.NestedModel,
            schema = { model:ChildModel };

        test('Default value', function () {
            /*
             var field = new editor({
             schema: schema
             }).render();

             deepEqual(field.getValue(), { id: 0, name: '' });
             */
            console.log('TODO');
        });

        test('Custom value', function () {
            var field = new editor({
                schema:schema,
                value:{
                    id:42,
                    name:"Krieger"
                }
            }).render();

            deepEqual(field.getValue(), { id:42, name:"Krieger" });
        });

        test('Value from model', function () {
            var agency = new Backbone.Model({
                spy:{
                    id:28,
                    name:'Pam'
                }
            });

            var field = new editor({
                schema:schema,
                model:agency,
                key:'spy'
            }).render();

            deepEqual(field.getValue(), { id:28, name:'Pam' });
        });

        test("TODO: idPrefix is added to child form elements", function () {
            console.log('TODO')
        });

        test("TODO: Validation on nested model", function () {
            console.log('TODO')
        });

        test("TODO: remove() - Removes embedded form", function () {
            console.log('TODO')
        });

        test("setValue() - updates the input value", function () {
            var agency = new Backbone.Model({
                spy:{
                    id:28,
                    name:'Pam'
                }
            });

            var field = new editor({
                schema:schema,
                model:agency,
                key:'spy'
            }).render();

            var newValue = {
                id:89,
                name:"Sterling"
            };

            field.setValue(newValue);

            deepEqual(field.getValue(), newValue);
        });

    })();

}));