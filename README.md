formal
======

A form framework for Backbone.JS applications.


Usage
-----

Define a 'schema' attribute on your Backbone models as below. The schema should match the attributes 
that get set on the model.

    var User = Backbone.Model.extend({
        schema: {
            
            id:         { type: 'Number' },
            name:       {},
            address:    { type: 'NestedModel' },
            email:      {title: 'Email address' },
            password:   { type: 'Password' }
        }
    });

Create the form in your Views:

    var formView = Backbone.View.extend({
        render: function() {
            var form = new formal.Form({
                model: this.model
            }).render();
            
            $(this.el).append(form.el);
            
            return this;
        }
    });
    

You can include selected fields, in custom order with the 'fields' parameter:
    
    var form = new formal.Form({
        model: this.model,
        fields: ['name', 'email', 'address']
    });

Once the user is done with the form, call commit() to apply the updated values to the model. If there are validation errors they will be returned:

    var errors = form.commit();


Schema definition
----------------
- Default editors can be referenced by their name as a string e.g. type: 'TextField'
- Custom editors can be created and referenced by their constructor functions e.g. type: MyCustomEditor
- Default editor type is 'TextField'
- Titles (which appear in &lt;label&gt;s) are automatically generated based on the key. camelCased keys will be converted to normal text e.g. emailAddress = 'Email Addresss'.
- Titles can be overridden by including the title option


Editors
-------

A Form is made up of various Fields.
A Field is made up of a &lt;label&gt; and an editor.

The following default editors are included:

- TextField
- Number
- Password
- TextArea
- Select
- Object
- NestedModel

In addition there is a separate file with editors that depend on jQuery UI:

- Date
- DateTime
- List


Custom Editors
---------------

Custom editors can be written. They must extend from formal.editors.Base.

    var CustomEditor = formal.editors.Base.extend({
        
        tagName: 'input',
        
        initialize: function(options) {
            //Call parent constructor
            formal.editors.Base.prototype.initialize.call(this, options);
            
            //Custom setup code.
            if (this.schema.customParam) this.doSomething();
        },
        
        render: function() {
            $(this.el).val(this.value);
            
            return this;
        },
        
        getValue: function() {
            return $(this.el).val();
        }
        
    });

Notes:
- The editor must implement a getValue().
- The original value is available through this.value.
- The field schema can be accessed via this.schema. This allows you to pass in custom parameters.


Defaults & Validation
----------

Formal uses the built in Backbone validation and defaults as defined on the model.

For validation, it will attempt to update the model and if there are validation failures, it will report them back.

See the Backbone documentation for more details.


Installation
------------

Requires BackboneJS and jQuery.

Include formal.js:

    <script src="lib/formal.js"></script>

Optionally, you can include the extra editors, for example those that require jQuery UI:

    <script src="lib/jquery-ui-editors.js"></script>


Contributors
------------

- Charles Davison - [powmedia](http://github.com/powmedia)
