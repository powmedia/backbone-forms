/**
 * Tel editor
 */
Form.editors.Tel = Form.editors.Text.extend({

    initialize: function(options) {
        Form.editors.Text.prototype.initialize.call(this, options);

        var schema = this.schema;

        this.$el.attr('type', 'tel');
    },

});