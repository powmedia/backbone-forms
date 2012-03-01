#backbone-forms

A flexible, customisable form framework for Backbone.JS applications. Includes validation, nested models and custom editors.

Simply define a schema on your models and the forms will be auto-generated for you:

    var User = Backbone.Model.extend({
        schema: {
            email:      { dataType: 'email', validators: ['required', 'email'] },
            start:      { type: 'DateTime' },
            contact:    { type: 'Object', subSchema: {
                            name: { validators: ['required'] },
                            phone: {}
                        }}
            address:    { type: 'NestedModel', model: Address },
            notes:      { type: 'List', help: 'Helpful notes' }
        }
    });
    
The schema above will automatically create a form similar to this:

![Example form](http://i56.tinypic.com/a3zfyt.png)



<a name="top"/>
##Table of Contents:
- [Installation](#installation)
- [AMD](#amd)
- [Usage](#usage)
- [Schema Definition](#schema-definition)
  - [Text](#editor-text)
  - [Checkboxes](#editor-checkboxes)
  - [Select](#editor-select)
  - [Radio](#editor-radio)
  - [Object](#editor-object)
  - [NestedModel](#editor-nestedmodel)
  - [Date](#editor-date)
  - [DateTime](#editor-datetime)
  - [List](#editor-list)
- [Validation](#validation)
- [More](#more)
  - [Editors without forms](#editors-without-forms)
  - [Using nested fields](#nested-fields)
  - [Custom editors](#custom-editors)
  - [Help](#help)



<a name="installation"/>
#Installation

Dependencies:
- [Backbone 0.9.1](http://documentcloud.github.com/backbone/)


Include backbone-forms.js and backbone-forms.css:

    <link href="backbone-forms/backbone-forms.css" rel="stylesheet" type="text/css"/> 
    <script src="backbone-forms/src/backbone-forms.js"></script>

Optionally, you can include the extra editors, for example those that require jQuery UI:

    <script src="backbone-forms/src/jquery-ui-editors.js"></script>
    
To use a custom template pack, e.g. Bootstrap, include the relevant file after backbone-forms.js:

    <script src="backbone-forms/src/templates/bootstrap.js"></script>

If you use BackboneJS with node.js, you can just `require('backbone-forms');` in your index file.
[Back to top](#top)


<a name="amd">
#AMD support [RequireJS](http://requirejs.org)
If you use Backbone Forms with require.js you can set up as follows

```javascript
 require.config({
            paths:{
                Backbone:'path/to/backbone-0.9.1-amd',
                underscore:'path/to/underscore-1.3.1-amd',
                'jquery-ui':'path/to/jquery-ui/jquery-ui-1.8.14.custom.min',
                'Backbone.Form':'path/to/backbone-forms',
                'jquery-editors':'path/to/jquery-ui-editors'
            }
        });

  require(['Backbone.Form'], function(Backbone){
        //your app here.

  });
```

Note the .js is missing.  This is on purpose.
Also note:
 Special versions of [underscore](https://github.com/amdjs/underscore) and [backbone](https://github.com/amdjs/backbone) to support AMD

 and this assumes your using the require-jquery.js [see](http://requirejs.org/docs/download.html#samplejquery)

[Back to top](#top)



<a name="usage"/>
#Usage

Define a 'schema' attribute on your Backbone models. The schema keys should match the attributes that get set on the model. Note that `type` defaults to `Text`.
See [schema definition](#schema-definition) for more information.

    var User = Backbone.Model.extend({
        schema: {
            email:      { dataType: 'email', validators: ['required', validateEmail] },
            start:      { type: 'DateTime' },
            contact:    { type: 'Object', subSchema: {
                            name: {},
                            phone: {}
                        }}
            address:    { type: 'NestedModel', model: Address },
            notes:      { type: 'List' }
        }
    });

Create the form in your Views:
    
    var formView = Backbone.View.extend({
        render: function() {
            var form = new Backbone.Form({
                model: users.get(userId)
            }).render();
            
            $(this.el).append(form.el);
            
            return this;
        }
    });


Once the user is done with the form, call commit() to apply the updated values to the model. If there are validation errors they will be returned. See [validation](#validation) for more information.

    var errors = form.commit();

To update a field after the form has been rendered, use `setValue`:

    model.bind('change:name', function(model, name) {
        form.fields.name.setValue(name);
    });


##Usage without models

You can create a form without tying it to a model. For example, to create a form for a simple object of data:

    var form = new Backbone.Form({
        data: { id: 123, name: 'Rod Kimble', password: 'cool beans' }, //Data to populate the form with
        schema: {
            id:         { type: 'Number' },
            name:       {},
            password:   { type: 'Password' }
        }
    }).render();

Then instead of form.commit(), do:
    
    var data = form.getValue(); //Returns object with new form values


##Initial data
If a form has a model attached to it, the initial values are taken from the model's defaults. Otherwise, you may pass default values using the `schema.data`.

[Back to top](#top)



<a name="schema-definition"/>
#Schema definition

The following default editors are included:

- [Text](#editor-text)
- Number
- Password
- TextArea
- Checkbox
- [Checkboxes](#editor-checkboxes)
- Hidden
- [Select](#editor-select)
- [Radio](#editor-radio)
- [Object](#editor-object)
- [NestedModel](#editor-nestedmodel)

In addition there is a separate file with editors that depend on jQuery UI:

- [Date](#editor-date)
- [DateTime](#editor-datetime)
- [List](#editor-list) (Editable and sortable. Can use any of the other editors for each item)



##Main attributes

For each field definition in the schema you can use the following optional attributes:

**`type`**

- The editor to use in the field
- Can be a string for any editor that has been added to Backbone.Form.editors, such as the built-in editors. E.g.: `{ type: 'TextArea' }`
- Or can be a constructor function, e.g. for a custom editor: `{ type: MyEditor }`
- If not defined, defaults to 'Text'

**`title`**

- Defines the text that appears in a form field's &lt;label&gt;
- If not defined, defaults to a formatted version of the camelCased field key. E.g. `firstName` becomes `First Name`. This behaviour can be changed by assigning your own function to Backbone.Form.helpers.keyToTitle.

**`validators`**

- A list of validators. See [Validation](#validation) for more information

**`help`**

- Help text to add next to the editor.



<a name="editor-text"/>
##Text

Creates a normal text input.

**`dataType`**

- Changes the type="text" attribute. Used for HTML5 form inputs such as `url`, `tel`, `email`.  When viewing on a mobile device e.g. iOS, this will change the type of keyboard that is opened. For example, `tel` opens a numeric keypad.


<a name="editor-select"/>
##Select

Creates and populates a &lt;select&gt; element.

**`options`**

- Options to populate the &lt;select&gt;
- Can be either:
    - String of HTML &lt;option&gt;`s
    - Array of strings/numbers
    - Array of objects in the form `{ val: 123, label: 'Text' }`
    - A Backbone collection
    - A function that calls back with one of the above 

Examples:
    
    var schema = {
        country: { 'Select', options: new CountryCollection() }
    };
    
    var schema = {
        users: { 'Select', options: function(callback) {
            users = db.getUsers();
            
            callback(users);
        }}
    }

**Backbone collection notes**

If using a Backbone collection as the `option` attribute, models in the collection must implement a `toString()` method. This populates the label of the &lt;option&gt;. The ID of the model populates the `value` attribute.

If there are no models in the collection, it will be `fetch()`ed.


<a name="editor-radio"/>
##Radio

Creates and populates a list of radio inputs. Behaves the same way and has the same options as a `Select`.


<a name="editor-checkboxes"/>
##Checkboxes

Creates and populates a list of checkbox inputs. Behaves the same way and has the same options as a `Select`. To set defaults for this editor, use an array of values.


<a name="editor-object"/>
##Object

The Object editor creates an embedded child form representing a Javascript object.

**`subSchema`**

- A schema object which defines the field schema for each attribute in the object

Examples:

    var schema = {
        address: { type: 'Object', subSchema: {
            street: {},
            zip: { type: 'Number' },
            country: { 'Select', options: countries }
        }}
    };


<a name="editor-nestedmodel"/>
##NestedModel

Used to embed models within models.  Similar to the Object editor, but adds validation of the child form (if it is defined on the model), and keeps your schema cleaner.

**`model`**

- A reference to the constructor function for your nested model
- The referenced model must have it's own `schema` attribute

Examples:

    var schema = {
        address: { type: 'NestedModel', model: Address }
    };
    

<a name="editor-list"/>
##List

Creates a sortable and editable list of items, which can be any of the above schema types, e.g. Object, Number, Text etc. Currently requires jQuery UI for creating dialogs etc.

**`listType`**

- Defines the editor that will be used for each item in the list.
- Similar in use to the main 'type' schema attribute.
- Defaults to 'Text'

**`itemToString`**

- Optional, but recommended when using listType 'Object'
- A function that returns a string representing how the object should be displayed in a list item.
- When listType is 'NestedModel', the model's `toString()` method will be used, unless a specific `itemToString()` function is defined on the schema.

**`sortable`**

- Optional. Set to false to disable drag and drop sorting

**`confirmDelete`**

- Optional. Whether to prompt the user before removing an item. Defaults to false.

**`confirmDeleteMsg`**

- Optional. Message to display to the user before deleting an item.


Examples:
    
    var schema = {
        users: { type: 'List', listType: 'Object', itemToString: function(user) {
                return user.firstName + ' ' + user.lastName;
            }
        }
    };


**Events**

The following events are fired when the user actions an item:

- `addItem`
- `editItem`
- `removeItem` 

Each event callback receives the relevant item value as an object, and a 'next' callback. To cancel the event and prevent the default action, do not run the callback.

This allows you to run asynchronous code, for example to check with the database that a username is available before adding a someone to the list:

    var form = new Backbone.Form({ model: this.model }),
        list = form.fields.list.editor;
    
    //Only add the item if the username is available
    list.bind('addItem', function(item, next) {
        database.getUser(item.username, function(user) {
            if (user) {
                //Item will not be added to the list because we don't call next();
                alert('The username is already taken');
            }
            else {
                //Username available; add the item to the list:
                next();
            }
        });
    });


<a name="editor-date"/>
##Date

Creates a jQuery UI datepicker


<a name="editor-datetime"/>
##DateTime

Creates a jQuery UI datepicker and time select field.

**`minsInterval`**

- Optional. Controls the numbers in the minutes dropdown. Defaults to 15, so it is populated with 0, 15, 30, and 45 minutes;



<a name="form-options"/>
#Form options

**`model`**

The model to tie the form to. Calling `form.commit()` will update the model with new values.

**`data`**

If not using the `model` option, pass a native object through the `data` option. Then use `form.getValue()` to get the new values.

**`schema`**

The schema to use to create the form. Pass it in if you don't want to store the schema on the model, or to override the model schema.

**`fieldsets`**

An array of fieldsets descriptions. A fieldset is either a list of field names, or an object with `legend` and `fields` attributes. The `legend` will be inserted at the top of the fieldset inside a `<legend>` tag; the list of fields will be treated as `fields` is below.

`fieldsets` takes priority over `fields`.

**`fields`**

An array of field names (keys). Only the fields defined here will be added to the form. You can also use this to re-order the fields.

**`idPrefix`**

A string that will be prefixed to the form DOM element IDs. Useful if you will have multiple forms on the same page. E.g. `idPrefix: 'user-'` will result in IDs like 'user-name', 'user-email', etc.

[Back to top](#top)



<a name="validation"/>
#Validation

There are 2 levels of validation: schema validators and the regular built-in Backbone model validation. Backbone Forms will run both when either `form.commit()` or `form.validate()` are called.


##Schema validation

Validators can be defined in several ways:

- **As a string** - Shorthand for adding a built-in validator. You can add custom validators to this list by adding them to `Backbone.Form.validators`. See the source for more information.
- **As an object** - For adding a built-in validator with options, e.g. overriding the default error message.
- **As a function** - Runs a custom validation function. Each validator the following arguments: `value` and `formValues`
- **As a regular expression** - Runs the built-in `regexp` validator with a custom regular expresssion.

###Examples

    var schema = {
        //Built-in validator
        name: { validators: ['required'] },
        
        //Multiple built-in validators
        email: { validators: ['required', 'email'] },
        
        //Built-in editors with options:
        password: { validators: [
            { type: 'match', field: 'passwordConfirm', message: 'Passwords must match!' }
        ] },
        
        //Regular expression
        foo: { validators: [/foo/] },
        
        //Custom function
        username: { validators: [
            function checkUsername(value, formValues) {
                var err = {
                    type: 'username',
                    message: 'Usernames must be at least 3 characters long'
                };
                
                if (value.length < 3) return err;
            }
        ] }
    }


###Handling errors

Error messages will be added to the field's help text area, and a customisable `bbf-error` class will be added to the field element so it can be styled with CSS.

Validation runs when `form.commit()` or `form.validate()` are called.  If validation fails, an error object is returned with the `type` (validator that failed) and customisable `message`:

    //Example returned errors from form validation:
    {
        name:   { type: 'required', message: 'Required' },              //Error on the name field
        email:  { type: 'email', message: 'Invalid email address' },    //Error on the email field
        _others: ['Custom model.validate() error']                      //Error from model.validate()
    }


###Built-in validators

- **required**: Checks the field has been filled in
- **email**: Checks it is a valid email address
- **url**: Checks it is a valid URL
- **match**: Checks that the field matches another. The other field name must be set in the `field` option.
- **regexp**: Runs a regular expression. Requires the `regexp` option, which takes a compiled regular expression.


##Customising error messages

After including the Backbone Forms file, you can override the default error messages.

{{mustache}} tags are supported; they will be replaced with the options passed into the validator configuration object. `{{value}}` is a special tag which is passed the current field value.

    Backbone.Form.validators.errMessages.required = 'Please enter a value for this field.';
    
    Backbone.Form.validators.errMessages.match = 'This value must match the value of {{field}}';
    
    Backbone.Form.validators.errMessages.email = '{{value}} is an invalid email address.';

You can also override the error message on a field by field basis by passing the `message` option in the validator config.


##Model validation

If your models have a `validate()` method the errors will be added to the error object.  To make the most of the validation system, the method should return an error object, keyed by the field object. If an unrecognised field is added, or just a string is returned, it will be added to the `_others` array of errors:

    var User = Backbone.Model.extend({
        validate: function(attrs) {
            var errs = {};
            
            if (usernameTaken(attrs.username)) errs.username = 'The username is taken'
            
            if !_.isEmpty(errs) return errs;
        }
    })




##Schema validators
Forms provide a `validate` method, which returns a dictionary of errors, or `null`. Validation is determined using the `validators` attribute on the schema (see above).

If you model provides a `validate` method, then this will be called when you call `Form.validate`. Forms are also validated when you call `commit`. See the Backbone documentation for more details on model validation.

Example:

    //Schema definition:
    var schema = {
        name: { validators: ['required']
    }
    
    var errors = form.commit();

[Back to top](#top)



<a name="customising-templates"/>
#Customising templates

Backbone-Forms comes with a few options for rendering HTML. To use another template pack, such as for [Bootstrap](http://twitter.github.com/bootstrap/), just include the .js file from the `templates` folder, after including `backbone-forms.js`.

You can use your own custom templates by passing your templates (in Mustache syntax) and class names into `Backbone.helpers.setTemplates()`. See the included templates files for examples.

[Back to top](#top)



<a name="more"/>
#More

<a name="editors-without-forms"/>
##Editors without forms

You can add editors by themselves, without being part of a form. For example: 

    var select = new Backbone.Form.editors.Select({
        model: user,
        key: 'country',
        options: getCountries()
    }).render();
    
    //When done, apply selection to model:
    select.commit();


<a name="nested-fields"/>
##Using nested fields

If you are using a schema with nested attributes (using the `Object` type), you may want to include only some of the nested fields in a form. This can be accomplished by using 'path' syntax as in the example below.

However, due to Backbone's lack of support for nested model attributes, getting and setting values will not work out of the box.  For this to work as expected you must adapt your model's get() and set() methods to handle the path names, or simply use [DeepModel](http://github.com/powmedia/backbone-deep-model) which will handle paths for you automatically.

    var Model = Backbone.DeepModel.extend({
        schema: {
            title: {},
            author: { type: 'Object', subSchema: {
                id: { type: 'Number' },
                name: { type: 'Object', subSchema: {
                    first: {},
                    last: {}
                }}
            }}
        }
    });
    
    var form = new Backbone.Form({
        model: new Model,
        fields: ['title', 'author.id', 'author.name.last']
    }).render();


<a name="custom-editors"/>
##Custom editors

Writing a custom editor is simple. They must extend from Backbone.Form.editors.Base.
    
    var CustomEditor = Backbone.Form.editors.Base.extend({
        
        tagName: 'input',
        
        initialize: function(options) {
            //Call parent constructor
            Backbone.Form.editors.Base.prototype.initialize.call(this, options);
            
            //Custom setup code.
            if (this.schema.customParam) this.doSomething();
        },
        
        render: function() {
            this.setValue(this.value);
            
            return this;
        },
        
        getValue: function() {
            return $(this.el).val();
        },
        
        setValue: function(value) {
            $(this.el).val(this.value);
        }
        
    });

**Notes:**

- The editor must implement a getValue() and setValue().
- The original value is available through this.value.
- The field schema can be accessed via this.schema. This allows you to pass in custom parameters.



<a name="help"/>
##Help & discussion

- [Google Groups](http://groups.google.com/group/backbone-forms)


##Contributors

- Charles Davison - [powmedia](http://github.com/powmedia)
