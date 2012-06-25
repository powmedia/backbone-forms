#backbone-forms

A flexible, customisable form framework for Backbone.JS applications.

- Simple schema definition to auto-generate forms
- Validation
- Nested forms
- Advanced and custom editors (e.g. NestedModel, List, Date, DateTime)
- Custom HTML templates


###Example

    var User = Backbone.Model.extend({
        schema: {
            title:      { type: 'Select', options: ['Mr', 'Mrs', 'Ms'] },
            name:       'Text',
            email:      { validators: ['required', 'email'] },
            birthday:   'Date',
            password:   'Password',
            address:    { type: 'NestedModel', model: Address },
            notes:      { type: 'List', listType: 'Text' }
        }
    });
    
    var user = new User();
    
    var form = new Backbone.Form({
        model: user
    }).render();
    
    $('body').append(form.el);


###Live editable demos
- [User form](http://jsfiddle.net/evilcelery/VkUFu/)
- [Form with Bootstrap templates and an Object list](http://jsfiddle.net/evilcelery/4XZMb/)



<a name="top"/>
##Guide

###Table of Contents:
- [Installation](#installation)
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
- [Customising templates](#customising-templates)
- [More](#more)
  - [Editors without forms](#editors-without-forms)
  - [Using nested fields](#nested-fields)
  - [Custom editors](#custom-editors)
  - [Help](#help)
  - [Changelog](#changelog)



<a name="installation"/>
##Installation

Dependencies:
- [Backbone 0.9.2](http://documentcloud.github.com/backbone/)


Include backbone-forms.js and backbone-forms.css:

    <script src="backbone-forms/distribution/backbone-forms.min.js"></script>
    <link href="backbone-forms/distribution/templates/default.css" rel="stylesheet" />

Optionally, you can include the extra editors, for example the List editor:

    <script src="backbone-forms/distribution/editors/list.min.js"></script>
    
To use a custom template pack, e.g. Bootstrap, include the relevants file after backbone-forms.js. You can remove `templates/default.css` and replace it with `templates/bootstrap.css`.

    <script src="backbone-forms/distribution/templates/bootstrap.js"></script>
    <link href="backbone-forms/distribution/templates/bootstrap.css" rel="stylesheet" />

If you use Backbone with node.js, you can just `require('backbone-forms');` in your index file.

Note there is also a distribution file for RequireJS / AMD.

[Back to top](#top)



<a name="usage"/>
##Usage

Define a 'schema' attribute on your Backbone models. The schema keys should match the attributes that get set on the model. `type` defaults to `Text`.  When you don't need to specify any options you can use the shorthand by passing the editor name as a string.
See [schema definition](#schema-definition) for more information.

    var User = Backbone.Model.extend({
        schema: {
            title:      { type: 'Select', options: ['Mr', 'Mrs', 'Ms'] },
            name:       'Text',
            email:      { validators: ['required', 'email'] },
            birthday:   'Date',
            password:   'Password',
            address:    { type: 'NestedModel', model: Address },
            notes:      { type: 'List', listType: 'Text' }
        }
    });
    
    var user = new User();
    
    var form = new Backbone.Form({
        model: user
    }).render();
    
    $('body').append(form.el);


Once the user is done with the form, call commit() to apply the updated values to the model. If there are validation errors they will be returned. See [validation](#validation) for more information.

    var errors = form.commit();

To update a field after the form has been rendered, use `setValue`:

    model.bind('change:name', function(model, name) {
        form.setValue({ name: name });
    });


###Usage without models

You can create a form without tying it to a model. For example, to create a form for a simple object of data:

    var form = new Backbone.Form({
        //Data to populate the form with
        data: {
          id: 123,
          name: 'Rod Kimble',
          password: 'cool beans'
        },
        
        //Schema
        schema: {
            id:         'Number',
            name:       'Text',
            password:   'Password'
        }
    }).render();

Then instead of form.commit(), do:
    
    var data = form.getValue(); //Returns object with new form values


###Initial data
If a form has a model attached to it, the initial values are taken from the model's defaults. Otherwise, you may pass default values using the `schema.data`.


<a name="schema-definition"/>
##Schema definition

The schema defined on your model can be the schema object itself, or a function that returns a schema object. This can be useful if you're referencing variables that haven't been initialized yet.

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
- [Date](#editor-date)
- [DateTime](#editor-datetime)
- [List](#editor-list) An editable list of items (included in a separate file: distribution/editors/list.min.js)


The old jQuery editors are still included but may be moved to another repository:
- [jqueryui.List](#editor-jui-list)
- jqueryui.Date (uses the jQuery UI popup calendar)
- jqueryui.DateTime



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

**`editorClass`**

- String of CSS class name(s) to add to the editor

**`editorAttrs`**

- A map of attributes to add to the editor, e.g. `{ maxlength: 30, title: 'Tooltip help' }`

**`fieldClass`**

- String of CSS class name(s) to add to the field

**`fieldAttrs`**

- A map of attributes to add to the field, e.g. `{ style: 'background: red', title: 'Tooltip help' }`

**`template`**

- Name of the template to use for this field. See [Customising templates](#customising-templates) for more information.



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
        country: { type: 'Select', options: new CountryCollection() }
    };
    
    var schema = {
        users: { type: 'Select', options: function(callback) {
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
    


<a name="editor-date"/>
##Date

Creates `<select>`s for date, month and year.

**`yearStart`**
- First year in the list. Default: 100 years ago

**`yearEnd`**
- Last year in the list. Default: current year


####Extra options
You can customise the way this editor behaves, throughout your app:

    var editors = Backbone.Form.editors;
    
    editors.Date.showMonthNames = false; //Defaults to true
    editors.Date.monthNames = ['Jan', 'Feb', ...] //Defaults to full month names in English


<a name="editor-datetime"/>
##DateTime

Creates a Date editor and adds `<select>`s for time (hours and minutes).

**`minsInterval`**

- Optional. Controls the numbers in the minutes dropdown.
- Defaults to 15, so it is populated with 0, 15, 30, and 45 minutes.


<a name="editor-list"/>
##List

Creates a list of items that can be added, removed and edited. Used to manage arrays of data.

This is a special editor which is in **a separate file and must be included**:

    <script src="backbone-forms/distribution/editors/list.min.js" />

**If using the `Object` or `NestedModel` listType**, you will need to include a modal adapter on the page. [Backbone.BootstrapModal](http://github.com/powmedia/backbone.bootstrap-modal) is provided for this purpose. It must be included on the page:

    <script src="backbone-forms/distribution/adapters/backbone.bootstrap-modal.min.js" />

*This list replaces the old jQueryUI list, but may need some upgrade work. The old jQueryUI List editor is still included in a separate file.*


####Schema options
**`itemType`**

- Defines the editor that will be used for each item in the list.
- Similar in use to the main 'type' schema attribute.
- Defaults to 'Text'.

**`confirmDelete`**

- Optional. Text to display in a delete confirmation dialog. If falsey, will not ask for confirmation.

**`itemToString`**

- Optional, but recommended when using listType 'Object'
- A function that returns a string representing how the object should be displayed in a list item.
- When listType is 'NestedModel', the model's `toString()` method will be used, unless a specific `itemToString()` function is defined on the schema.

**`listTemplate`**

- Name of the template to hold the list. Edit if you want to customize the 'Add' button, for instance.
- Optional, defaults to 'list'

Examples:
    
    function userToName(user) {
        return user.firstName + ' ' + user.lastName;
    }
    
    var schema = {
        users: { type: 'List', itemType: 'Object', itemToString: userToName }
    };



<a name="form-options"/>
##Form options

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

If not defined, the model's CID will be used as a prefix to avoid conflicts when there are multiple instances of the form on the page. To override this behaviour, pass a null value to `idPrefix`.

**`template`**

The template name to use for generating the form. E.g.:

    Backbone.Form.setTemplates({
      customForm: '<form class="custom-form">{{fieldsets}}</form>'
    });
    
    var form = new Backbone.Form({
      model: user,
      template: 'customForm'
    });

[Back to top](#top)



<a name="validation"/>
##Validation

There are 2 levels of validation: schema validators and the regular built-in Backbone model validation. Backbone Forms will run both when either `form.commit()` or `form.validate()` are called.


###Schema validation

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


###Customising error messages

After including the Backbone Forms file, you can override the default error messages.

{{mustache}} tags are supported; they will be replaced with the options passed into the validator configuration object. `{{value}}` is a special tag which is passed the current field value.

    Backbone.Form.validators.errMessages.required = 'Please enter a value for this field.';
    
    Backbone.Form.validators.errMessages.match = 'This value must match the value of {{field}}';
    
    Backbone.Form.validators.errMessages.email = '{{value}} is an invalid email address.';

You can also override the error message on a field by field basis by passing the `message` option in the validator config.


###Model validation

If your models have a `validate()` method the errors will be added to the error object.  To make the most of the validation system, the method should return an error object, keyed by the field object. If an unrecognised field is added, or just a string is returned, it will be added to the `_others` array of errors:

    var User = Backbone.Model.extend({
        validate: function(attrs) {
            var errs = {};
            
            if (usernameTaken(attrs.username)) errs.username = 'The username is taken'
            
            if !_.isEmpty(errs) return errs;
        }
    })




###Schema validators
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
##Customising templates

Backbone-Forms comes with a few options for rendering HTML. To use another template pack, such as for [Bootstrap](http://twitter.github.com/bootstrap/), just include the .js file from the `templates` folder, after including `backbone-forms.js`.

You can use your own custom templates by passing your templates (in Mustache syntax) and class names into `Backbone.Form.setTemplates()`. See the included templates files for examples.

You can include different field templates and then use them on a field-by-field basis by passing the `template` option in the field schema.

Example: 

    var templates = {
      //field is the default template used
      field: '\
        <div>\
          <label for="{{id}}">{{title}}</label>\
          <div>{{editor}}</div> <div>{{help}}</div>\
        </div>\
      ',
    
      //Specify an alternate field template
      altField: '<div class="altField">{{editor}}</div>'
    };
    
    //Set the templates
    Backbone.Form.setTemplates(templates, classNames);
    
    var schema = {
      age: { type: 'Number' }, //Uses the default 'field' template
      name: { template: 'altField' } //Uses the 'altField' template
    };

[Back to top](#top)



<a name="changing-template-compiler"/>
###Changing template compiler

You can use your own custom template compiler, like [Handlebars](http://handlebarsjs.com/) by passing a reference to the function into `Backbone.Form.setTemplateCompiler()`.

Example:

    Backbone.Form.setTemplateCompiler(Handlebars.compile);

[Back to top](#top)



<a name="more"/>
##More

<a name="editors-without-forms"/>
###Editors without forms

You can add editors by themselves, without being part of a form. For example: 

    var select = new Backbone.Form.editors.Select({
        model: user,
        key: 'country',
        options: getCountries()
    }).render();
    
    //When done, apply selection to model:
    select.commit();


<a name="nested-fields"/>
###Using nested fields

If you are using a schema with nested attributes (using the `Object` type), you may want to include only some of the nested fields in a form. This can be accomplished by using 'path' syntax as in the example below.

However, due to Backbone's lack of support for nested model attributes, getting and setting values will not work out of the box.  For this to work as expected you must adapt your model's get() and set() methods to handle the path names, or simply use [DeepModel](http://github.com/powmedia/backbone-deep-model) which will handle paths for you automatically.

    var Model = Backbone.DeepModel.extend({
        schema: {
            title: 'Text',
            author: { type: 'Object', subSchema: {
                id: 'Number',
                name: { type: 'Object', subSchema: {
                    first: 'Text',
                    last: 'Text'
                }}
            }}
        }
    });
    
    var form = new Backbone.Form({
        model: new Model,
        fields: ['title', 'author.id', 'author.name.last']
    }).render();

The following shorthand is also valid:

    var Model = Backbone.DeepModel.extend({
        schema: {
            title: 'Text',
            'author.id': 'Number',
            'author.name.first': 'Text'
        }
    });

    var form = new Backbone.Form({
        model: new Model
    })


<a name="custom-editors"/>
###Custom editors

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


<a name="changelog"/>
##Changelog

###master
- Fix not rendering of hidden fields (#75) (DouweM)
- DateTime editor:
    - Convert strings to dates
    - Remove built-in Date editor before removing self
- Email validator should accept "+" sign (#70)


###0.10.0
- Refactor rendering.
    - <legend> tags are now defined in the template.
    - Where a template is used, (e.g. advanced editors, field etc.), the entirety of the HTML is now defined in the template to make custom templating easier.
    - All templates must now have a main 'parent' element.
- Create new List, Date and DateTime editors that don't rely on jQuery UI.
    - You will still need to use jQuery UI editors for the calendar.
    - For list items of type `Object` and `NestedModel` you must include a modal adapter, such as the included Bootstrap Modal one. Should create one for jQuery UI.
- Improve the way dependencies are defined and module is exported for browser & CommonJS
- Add underscore dependency to AMD version
- Use [buildify](http://github.com/powmedia/buildify) for building distribution files.
- Rename jQuery UI editors to jqueryui.List, jqueryui.Date, jqueryui.DateTime. These may be moved to a separate repository soon.
- Fix #65 Number editor Firefox NaN bug
- Fix bug with hidden fields (jeffutter)
- Fix AMD distribution bug (ikr)

####Required changes when upgrading:
- List editor:
    - Change 'listType' to 'itemType' in schema definition.
    - Make sure you have a modal adapter included if using Object and NestedModel itemTypes. See the List editor section.

###0.9.0
- Added ability to use a custom template compiler (geowa4)
- Added distribution files (development and minified production versions)
- Added AMD-compatible version (development and minified production versions)
