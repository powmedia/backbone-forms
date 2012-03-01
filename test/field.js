(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['Backbone.Form','Post'], factory);
    } else {
        // RequireJS isn't being used. Assume backbone is loaded in <script> tags
        factory(Backbone, Post);
    }
}(function (Backbone, Post) {
    var Form = Backbone.Form,
        Field = Form.Field,
        editors = Form.editors;

    module('Field');

    test("'schema.type' option - Specifies editor to use", function () {
        var field = new Field({
            value:'test',
            key:'title',
            schema:{ type:'Text' }
        }).render();

        ok(field.editor instanceof editors.Text);

        var field = new Field({
            value:'test',
            key:'title',
            schema:{ type:'Number' }
        }).render();

        ok(field.editor instanceof editors.Number);
    });

    test("'schema.type' option - Defaults to 'Text'", function () {
        var field = new Field({
            value:'test',
            key:'title',
            schema:{}
        }).render();

        ok(field.editor instanceof editors.Text);
    });

    test("'schema.title' option - Populates the <label>", function () {
        var field = new Field({
            value:'test',
            key:'title',
            schema:{ title:'Post Title' }
        }).render();

        equal($('label', field.el).html(), 'Post Title');
    });

    test("'schema.title' option - Defaults to formatted version of 'key' option", function () {
        var field = new Field({
            value:'test',
            key:'title',
            schema:{}
        }).render();

        equal($('label', field.el).html(), 'Title');

        var field = new Field({
            value:'test',
            key:'camelCasedTitle',
            schema:{}
        }).render();

        equal($('label', field.el).html(), 'Camel Cased Title');
    });

    test("'schema.help' option - Specifies help text", function () {
        var field = new Field({
            key:'title',
            schema:{ help:'Some new help text' }
        }).render();

        equal($('.bbf-help', field.el).html(), 'Some new help text');
    });

    test("'model' option - Populates the field with the given 'key' option from the model", function () {
        var field = new Field({
            model:new Post,
            key:'title'
        }).render();

        equal($('#title', field.el).val(), 'Danger Zone!');
    });

    test("'value' option - Populates the field", function () {
        var field = new Field({
            value:'test',
            key:'title'
        }).render();

        equal($('#title', field.el).val(), 'test');
    });

    test("'idPrefix' option - Specifies editor's DOM element ID prefix", function () {
        var field = new Field({
            value:'test',
            key:'title',
            idPrefix:'prefix_'
        }).render();

        equal($('#prefix_title', field.el).length, 1);
    });


    test("commit() - Calls editor commit", function () {
        expect(1);

        var field = new Field({
            key:'title'
        }).render();

        //Mock
        var called = false;
        field.editor.commit = function () {
            called = true;
        };

        field.commit();

        ok(called, 'Called editor.commit');
    });

    test("getValue() - Returns the new value", function () {
        var field = new Field({
            value:'Initial Title',
            key:'title'
        }).render();

        //Change field value
        $('#title', field.el).val('New Title');

        equal(field.getValue(), 'New Title');
    });

    test("setValue() - Sets the new value", function () {
        var field = new Field({
            value:'Initial Title',
            key:'title'
        }).render();

        field.setValue('New Title');

        equal(field.getValue(), 'New Title');
    });

    test("remove() - Removes the editor view", function () {
        var counter = 0;

        //Mock out the remove method so we can tell how many times it was called
        var _remove = Backbone.View.prototype.remove;
        Backbone.View.prototype.remove = function () {
            counter++;
        }

        var field = new Field({
            model:new Post,
            key:'title'
        }).render();

        field.remove();

        //remove() should have been called twice (once for the editor and once for the field)
        equal(counter, 2);

        //Restore remove method
        Backbone.View.prototype.remove = _remove;
    });

    test('commit() - sets value to model', function () {
        var post = new Post;

        var field = new Field({
            model:post,
            key:'title'
        }).render();

        //Change value
        field.setValue('New Title');

        field.commit();

        equal(post.get('title'), 'New Title');
    });

    test('validate() - calls setError if validation fails', function () {
        expect(3);

        var field = new Field({
            key:'title',
            schema:{ validators:['required'] }
        }).render();

        //Mocks
        var calledSetError = false,
            errMsg = null;

        field.setError = function (msg) {
            calledSetError = true;
            errMsg = msg;
        }

        //Make validation fail
        field.setValue(null);
        var err = field.validate();

        //Test
        ok(calledSetError, 'calledSetError');
        deepEqual(err, {
            type:'required',
            message:'Required'
        });
        equal(errMsg, err.message);
    });

    test('validate() - calls clearError if validation passes', function () {
        expect(1);

        var field = new Field({
            key:'title',
            schema:{ validators:['required'] }
        }).render();

        //Trigger error to appear
        field.setValue(null);
        field.validate();

        //Mocks
        var calledClearError = false;
        field.clearError = function (msg) {
            calledClearError = true;
        }

        //Trigger validation to pass
        field.setValue('ok');
        field.validate();

        //Test
        ok(calledClearError, 'calledClearError');
    });

    test('setError() - sets field error class name and error message', function () {
        var errorClass = Form.classNames.error;

        var field = new Field({
            key:'title',
            schema:{ validators:['required'] }
        }).render();

        field.setError('foo');
        ok($(field.el).hasClass(errorClass));
        equal(field.$help.html(), 'foo');
    });

    test('setError() - returns if the editor is a "nested" type', function () {
        var errorClass = Form.classNames.error;

        var field = new Field({
            key:'nested',
            schema:{ type:'Object', subSchema:{ title:{} } }
        }).render();

        field.setError('foo');

        equal($(field.el).hasClass(errorClass), false);
    });

    test('clearError() - clears error class and resets help message', function () {
        var errorClass = Form.classNames.error;

        var field = new Field({
            key:'email',
            schema:{ validators:['email'], help:'Help message' }
        }).render();

        //Trigger error message
        field.setError('foo')

        //Clear error message
        field.clearError();

        //Test
        equal($(field.el).hasClass(errorClass), false);
        equal(field.$help.html(), 'Help message');
    })
}))
