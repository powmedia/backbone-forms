(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define('Post', ['Backbone.Form'], factory);
    } else {
        // RequireJS isn't being used. Assume backbone is loaded in <script> tags
        factory(Backbone);
    }
}(function (Backbone) {
    var Form = Backbone.Form,
        Field = Form.Field,
        editors = Form.editors;

    var Post = Backbone.Model.extend({
        defaults:{
            title:'Danger Zone!',
            content:'I love my turtleneck',
            author:'Sterling Archer',
            slug:'danger-zone'
        },

        schema:{
            title:{ type:'Text' },
            content:{ type:'TextArea' },
            author:{},
            slug:{}
        }
    });

    return Post;
}))
