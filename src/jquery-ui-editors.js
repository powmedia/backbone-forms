;(function() {
    
    var Form = Backbone.Form,
        Base = Form.editors.Base,
        createTemplate = Form.helpers.createTemplate
        exports = {};
    
    /**
     * Additional editors that depend on jQuery UI
     */
    exports.Date = Base.extend({

        className: 'bbf-date',

        render: function() {
            var el = $(this.el);

            el.html('<input>');

            var input = $('input', el);

            input.datepicker({
                dateFormat: 'dd/mm/yy',
                showButtonPanel: true
            });

            input.datepicker('setDate', this.value);

            return this;
        },

        /**
        * @return {Date}   Selected date
        */
        getValue: function() {
            var input = $('input', this.el),
                date = input.datepicker('getDate');

            return date;
        }

    });



    exports.DateTime = exports.Date.extend({

        className: 'bbf-datetime',

        template: createTemplate('<select>{{hours}}</select> : <select>{{mins}}</select>'),

        render: function() {
            function pad(n) {
                return n < 10 ? '0' + n : n
            }

            //Render the date element first
            exports.Date.prototype.render.call(this);

            //Setup hour options
            var hours = _.range(0, 24),
                hoursOptions = [];

            _.each(hours, function(hour) {
                hoursOptions.push('<option value="'+hour+'">' + pad(hour) + '</option>');
            });

            //Setup minute options
            var mins = _.range(0, 60, 15),
                minsOptions = [];

            _.each(mins, function(min) {
                minsOptions.push('<option value="'+min+'">' + pad(min) + '</option>');
            });

            //Render time selects
            $(this.el).append(this.template({
                hours: hoursOptions.join(),
                mins: minsOptions.join()
            }));

            //Store references to selects
            this.$hours = $('select:eq(0)', this.el);
            this.$mins = $('select:eq(1)', this.el);

            //Set time
            var time = this.value;
            this.$hours.val(time.getHours());
            this.$mins.val(time.getMinutes());

            return this;
        },

        /**
        * @return {Date}   Selected datetime
        */
        getValue: function() {
            var input = $('input', this.el),
                date = input.datepicker('getDate');

            date.setHours(this.$hours.val());
            date.setMinutes(this.$mins.val());
            date.setMilliseconds(0);

            return date;
        }

    });


    exports.List = Base.extend({

        className: 'bbf-list',

        //Note: The extra div around the <ul> is used to limit the drag area
        template: createTemplate('\
            <ul></ul>\
            <div class="cf"><button class="add">Add</div>\
        '),

        itemTemplate: createTemplate('\
            <li class="cf">\
                <span class="text">{{text}}</span>\
                <div class="actions">\
                    <button class="edit">Edit</button>\
                    <button class="del">Delete</button>\
                </div>\
            </li>\
        '),

        events: {
            'click .add':   'addNewItem',
            'click .edit':  'editItem',
            'click .del':   'deleteItem'
        },

        initialize: function(options) {
            Base.prototype.initialize.call(this, options);

            if (!this.schema) throw "Missing required option 'schema'";

            this.items = [];
        },

        render: function() {
            //Main element
            $(this.el).html(this.template());

            //Create list
            var self = this,
                data = this.value || [],
                schema = this.schema,
                itemToString = this.itemToString,
                itemTemplate = this.itemTemplate,
                listEl = $('ul', this.el);

            _.each(data, function(itemData) {     
                var text = itemToString.call(self, itemData);

                //Create DOM element
                var li = $(itemTemplate({ text: text }));

                //Attach data
                $.data(li[0], 'data', itemData);

                listEl.append(li);
            });

            //Make sortable
            listEl.sortable({
                axis: 'y',
                cursor: 'move',
                containment: 'parent'
            });

            //jQuery UI buttonize
            $('button.add', this.el).button({
                text: false,
                icons: { primary: 'ui-icon-plus' }
            });
            $('button.edit', this.el).button({
                text: false,
                icons: { primary: 'ui-icon-pencil' }
            });
            $('button.del', this.el).button({
                text: false,
                icons: { primary: 'ui-icon-trash' }
            });

            return this;
        },

        /**
         * Formats an item for display in the list
         * For example objects, dates etc. can have a custom
         * itemToString method which says how it should be formatted.
         */
        itemToString: function(data) {
            if (!data) return data;
            
            var schema = this.schema;
            
            //If there's a specified toString use that
            if (schema.itemToString)
                return schema.itemToString(data);
            
            //Otherwise check if it's a model with a toString method
            if (schema.listType == 'NestedModel' && schema.model) {
                var model = new schema.model(data);
                if (model.toString)
                    return model.toString();
            }
            
            //Last resort, just return the data as is
            return data;
        },

        /**
         * Add a new item to the list if it is completed in the editor
         */
        addNewItem: function(event) {            
            var self = this;

            this.openEditor(null, function(value) {
                var text = self.itemToString(value);

                //Create DOM element
                var li = $(self.itemTemplate({ text: text }));

                //Store data
                $.data(li[0], 'data', value);

                $('ul', self.el).append(li);

                //jQuery UI buttonize
                $('button.edit', this.el).button({
                    text: false,
                    icons: { primary: 'ui-icon-pencil' }
                });
                $('button.del', this.el).button({
                    text: false,
                    icons: { primary: 'ui-icon-trash' }
                });
            });
        },

        /**
         * Edit an existing item in the list
         */
        editItem: function(event) {
            console.log('edit');

            var self = this,
                li = $(event.target).closest('li'),
                originalValue = $.data(li[0], 'data');

            this.openEditor(originalValue, function(newValue) {
                //Update display
                $('.text', li).html(self.itemToString(newValue));

                //Store data
                $.data(li[0], 'data', newValue);
            });
        },

        deleteItem: function(event) {
            console.log('delete');

            var li = $(event.target).closest('li');

            li.remove();
        },

        /**
         * Opens the sub editor dialog
         * @param {Mixed}       Data (if editing existing list item, null otherwise)
         * @param {Function}    Save callback. receives: value
         */
        openEditor: function(data, callback) {
            console.log('openEditor');

            var self = this,
                schema = this.schema,
                listType = schema.listType || 'Text';

            var editor = Form.helpers.createEditor(listType, {
                key: '',
                schema: schema,
                value: data
            }).render();

            var close = function() {
                $(editor.el).dialog('close');

                editor.remove();
            };

            $(editor.el).dialog({
                resizable:  false,
                modal:      true,
                width:      500,
                title:      data ? 'Edit item' : 'New item',
                buttons: {
                    'OK': function() {
                        callback(editor.getValue());
                        close();
                    }, 
                    'Cancel': close
                }
            });
        },

        getValue: function() {
            var data = [];

            $('li', this.el).each(function(index, li) {
                data.push($.data(li, 'data'));
            });

            return data;
        }

    });


    //Exports
    _.extend(Form.editors, exports);
    
})();
