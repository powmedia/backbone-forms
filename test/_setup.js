var same = deepEqual;

sinon.config.useFakeTimers = false;

// Patch $el.is(':focus') until PhantomJS supports it properly.
// https://code.google.com/p/phantomjs/issues/detail?id=427
var _jQuery_is = jQuery.fn.is;
jQuery.fn.is = function(s) {
    if (s === ':focus') {
        return this.get(0) === document.activeElement;
    }
    return _jQuery_is.apply(this, arguments);
};

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
