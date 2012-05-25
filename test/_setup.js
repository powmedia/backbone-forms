var Form = Backbone.Form,
    Field = Form.Field,
    editors = Form.editors;

var Post = Backbone.Model.extend({
    defaults: {
        title: 'Danger Zone!',
        content: 'I love my turtleneck',
        author: 'Sterling Archer',
        slug: 'danger-zone'
    },
    
    schema: {
        title:      { type: 'Text' },
        content:    { type: 'TextArea' },
        author:     {},
        slug:       {}
    }
});
