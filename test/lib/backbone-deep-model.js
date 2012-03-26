/**
 * Improves Backbone Model support when nested attributes are used.
 * get() and set() can take paths e.g. 'user.name'
 */
;(function(Backbone) {

    /**
     * Takes a nested object and returns a shallow object keyed with the path names
     * e.g. { "level1.level2": "value" }
     * 
     * @param  {Object}      Nested object e.g. { level1: { level2: 'value' } }
     * @return {Object}      Shallow object with path names e.g. { 'level1.level2': 'value' }
     */
    function objToPaths(obj) {
        var ret = {};

        for (var key in obj) {
            var val = obj[key];

            if (val && val.constructor === Object) {
                //Recursion for embedded objects
                var obj2 = objToPaths(val);

                for (var key2 in obj2) {
                    var val2 = obj2[key2];

                    ret[key+'.'+key2] = val2;
                }
            } else {
                ret[key] = val;
            }
        }

        return ret;
    }

    /**
     * @param {Object}  Object to fetch attribute from
     * @param {String}  Object path e.g. 'user.name'
     * @return {Mixed}
     */
    function getNested(obj, path, return_exists) {
        var fields = path.split(".");
        var result = obj;
        return_exists || (return_exists = false)
        for (var i = 0, n = fields.length; i < n; i++) {
            if (return_exists
                && !_.has(result, fields[i]))
            {
                return false
            }
            result = result[fields[i]];
            
            if (typeof result === 'undefined') {
                if (return_exists)
                {
                    return true;
                }
                return result;
            }
        }
        if (return_exists)
        {
            return true;
        }
        return result;
    }
    
    /**
     * @param {Object}  Object to fetch attribute from
     * @param {String}  Object path e.g. 'user.name'
     * @param {Mixed}   Value to set
     */
    function setNested(obj, path, val, options) {
        var fields = path.split(".");
        var result = obj;
        for (var i = 0, n = fields.length; i < n; i++) {
            var field = fields[i];
            
            //If the last in the path, set the value
            if (i === n - 1) {
                options.unset ? delete result[field] : result[field] = val;
            } else {
                //Create the child object if it doesn't exist
                if (typeof result[field] === 'undefined') {
                    result[field] = {};
                }
                
                //Move onto the next part of the path
                result = result[field];
            }
        }
    }

    var DeepModel = Backbone.Model.extend({
       
        // Override get
        // Supports nested attributes via the syntax 'obj.attr' e.g. 'author.user.name'
        get: function(attr) {
            return getNested(this.attributes, attr);
        },

        // Override set
        // Supports nested attributes via the syntax 'obj.attr' e.g. 'author.user.name'
        set: function(key, value, options) {
            var attrs, attr, val;
            if (_.isObject(key) || key == null) {
                attrs = key;
                options = value;
            } else {
                attrs = {};
                attrs[key] = value;
            }

            // Extract attributes and options.
            options || (options = {});
            if (!attrs) return this;
            if (attrs instanceof Backbone.Model) attrs = attrs.attributes;
            if (options.unset) for (attr in attrs) attrs[attr] = void 0;

            // Run validation.
            if (!this._validate(attrs, options)) return false;

            // Check for changes of `id`.
            if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

            var now = this.attributes;
            var escaped = this._escapedAttributes;
            var prev = this._previousAttributes || {};
            var alreadySetting = this._setting;
            this._changed || (this._changed = {});
            this._setting = true;


            // <custom code>
            attrs = objToPaths(attrs);
            // Update attributes.
            for (attr in attrs) {
                val = attrs[attr];
                var current_value = getNested(now, attr);
                var previous_value = getNested(prev, attr);
                var attr_existed  = getNested(prev, attr, true);

                if (!_.isEqual(current_value, val)) setNested(escaped, attr, undefined, {unset: true});
                setNested(now, attr, val, options);
                if (this._changing && !_.isEqual(this._changed[attr], val)) {
                    this.trigger('change:' + attr, this, val, options);
                    this._moreChanges = true;
                }
                delete this._changed[attr];
                var attr_exists  = getNested(now, attr, true);
                if (!_.isEqual(previous_value, val) || attr_exists != attr_existed) {
                    this._changed[attr] = val;
                }
            }
            // </custom code>

            // Fire the `"change"` events, if the model has been changed.
            if (!alreadySetting) {
                if (!options.silent && this.hasChanged()) this.change(options);
                this._setting = false;
            }
            return this;
        },

        // Override has
        has: function(attr) {
            return getNested(this.attributes, attr) != null;
        }

    });
    
    
    //Exports
    Backbone.DeepModel = DeepModel;

    //For use in NodeJS
    if (typeof module != 'undefined') module.exports = DeepModel;
    
})(Backbone);
