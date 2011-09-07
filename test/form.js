module("Form");

test("'schema' option - Schema object is used to create the form", function() {
    var post = new Post();

    var form = new Form({
        model: post
    }).render();

    //Stored correct schema object
    equal(form.schema, post.schema);

    //Check correct fields have been added
    equal($('input', form.el).length, 3);
    equal($('textarea', form.el).length, 1);
});

test("'schema' option - If not present, the 'schema' attribute on the model is used", function() {
    var post = new Post(),
        customSchema = { name: {} };

    var form = new Form({
        model: post,
        schema: customSchema
    }).render();

    //Check correct fields have been added
    equal($('input', form.el).length, 1);
    equal($('input:eq(0)', form.el).attr('id'), 'name');
});

test("'model' option - Populates the form", function() {
    var post = new Post();

    var form = new Form({
        model: post
    }).render();

    equal($('#title', form.el).val(), 'Danger Zone!');
    equal($('#author', form.el).val(), 'Sterling Archer');
});

test("'data' option - Used if no model provided. Populates the form.", function() {
    var data = {
        title: 'Yuuup', 
        author: 'Lana Kang'
    };

    var form = new Form({
        data: data,
        schema: {
            title: {},
            author: {}
        }
    }).render();

    equal($('#title', form.el).val(), 'Yuuup');
    equal($('#author', form.el).val(), 'Lana Kang');
});

test("'fields' option - Allows choosing and ordering fields from the schema", function() {
    var form = new Form({
        model: new Post,
        fields: ['author', 'slug']
    }).render();

    equal($('input:eq(0)', form.el).attr('id'), 'author');
    equal($('input:eq(1)', form.el).attr('id'), 'slug');
});

test("'idPrefix' option - Adds prefix to all DOM element IDs", function() {
    var form = new Form({
        model: new Post,
        idPrefix: 'form_'
    }).render();

    equal($('#form_title', form.el).length, 1);
});

test("commit() - updates the model with form values", function() {
    var post = new Post();

    var form = new Form({
        model: post
    }).render();

    //Change the title in the form and save
    $('#title', form.el).val('New title');        
    form.commit();

    equal(post.get('title'), 'New title');
});

test("Form.getValue() - returns form value as an object", function() {
    var data = {
        title: 'Yuuup', 
        author: 'Lana Kang'
    };

    var form = new Form({
        data: data,
        schema: {
            title: {},
            author: {}
        }
    }).render();

    //Change the title in the form and save
    $('#title', form.el).val('Nooope');
    
    var result = form.getValue();
    
    equal(result.title, 'Nooope');
    equal(result.author, 'Lana Kang');
});


