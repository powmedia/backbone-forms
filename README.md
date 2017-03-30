#backbone-forms

A flexible, customisable form framework for Backbone.js applications.

- Simple schema definition to auto-generate forms
- Validation
- Nested forms
- Advanced and custom editors (e.g. NestedModel, List, Date, DateTime)
- Custom HTML templates


###Example: Quickly generate forms to edit models

```js
var User = Backbone.Model.extend({
    schema: {
        title:      { type: 'Select', options: ['Mr', 'Mrs', 'Ms'] },
        name:       'Text',
        email:      { validators: ['required', 'email'] },
        birthday:   'Date',
        password:   'Password',
        address:    { type: 'NestedModel', model: Address },
        notes:      { type: 'List', itemType: 'Text' }
    }
});

var user = new User();

var form = new Backbone.Form({
    model: user
}).render();

$('body').append(form.el);
```

###Example: Fully customise forms and templates

HTML:
```
<script id="formTemplate" type="text/html">
    <form>
        <h1>New User</h1>

        <h2>Main Info</h2>
        <div data-fields="title,name,birthday"></div>

        <h2>Account Info</h2>
        <h3>Email</h3>
        <div data-fields="email"></div>

        <h3>Password</h3>
        <p>Must be at least 8 characters long</p>
        <div data-editors="password"></div>
    </form>
</script>
```

Javascript:
```js
var UserForm = Backbone.Form.extend({
    template: _.template($('#formTemplate').html()),

    schema: {
        title:      { type: 'Select', options: ['Mr', 'Mrs', 'Ms'] },
        name:       'Text',
        email:      { validators: ['required', 'email'] },
        password:   'Password'
    }
});

var form = new UserForm({
    model: new User()
}).render();

$('body').append(form.el);
```


###Live editable demos
- [User form](http://jsfiddle.net/gfaq5km1/)
- [Update form elements based on user input](http://jsfiddle.net/wc7e97v1/)
- [Validate on blur](http://jsfiddle.net/68s6ynfh/)
- [Built-in Validators](http://jsfiddle.net/glenpike/63tj1ynk/)
- [Nested Models & List Editors](https://jsfiddle.net/glenpike/wtruLbs1/19/)



<a name="top"/>
##Guide

###Table of Contents:
- [Installation](#installation)
- [Usage](#usage)
- [Backbone.Form](#form)
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
- [Backbone 1.0+](http://documentcloud.github.com/backbone/)


Include backbone-forms.js:

    <script src="backbone-forms/distribution/backbone-forms.min.js"></script>

Optionally, you can include the extra editors, for example the List editor:

    <script src="backbone-forms/distribution/editors/list.min.js"></script>

To use a custom template pack, e.g. Bootstrap, include the relevant files after backbone-forms.js.

    <script src="backbone-forms/distribution/templates/bootstrap.js"></script>
    <link href="backbone-forms/distribution/templates/bootstrap.css" rel="stylesheet" />

If you use Backbone with browserify or node.js, you can just `require('backbone-forms');` in your index file.  If doing this you will need to set `Backbone.$`, e.g. `Backbone.$ = require('jquery')`.

Note there is also a distribution file for RequireJS / AMD.

[Back to top](#top)



<a name="usage"/>
##Usage

Forms are generated from a `schema`, which can be defined on the form itself or on a model.

The schema keys should match the attributes that get set on the model. `type` defaults to `Text`.  When you don't need to specify any options you can use the shorthand by passing the editor name as a string.
See [schema definition](#schema-definition) for more information.

```js
var User = Backbone.Model.extend({
    schema: {
        title:      { type: 'Select', options: ['Mr', 'Mrs', 'Ms'] },
        name:       'Text',
        email:      { validators: ['required', 'email'] },
        birthday:   'Date',
        password:   'Password',
        address:    { type: 'NestedModel', model: Address },
        notes:      { type: 'List', itemType: 'Text' }
    }
});

var user = new User();

var form = new Backbone.Form({
    model: user
}).render();

$('body').append(form.el);
```

Once the user is done with the form, call `form.commit()` to apply the updated values to the model. If there are validation errors they will be returned.
See [validation](#validation) for more information.

    var errors = form.commit(); // runs schema validation

or

    var errors = form.commit({ validate: true }); // runs schema and model validation

To update a field after the form has been rendered, use `form.setValue`:

    model.on('change:name', function(model, name) {
        form.setValue({ name: name });
    });


###Usage without models

You can create a form without tying it to a model. For example, to create a form for a simple object of data:

```js
var form = new Backbone.Form({
    //Schema
    schema: {
        id:         'Number',
        name:       'Text',
        password:   'Password'
    },

    //Data to populate the form with
    data: {
      id: 123,
      name: 'Rod Kimble',
      password: 'cool beans'
    }
}).render();
```

Then instead of `form.commit()`, do:

    var data = form.getValue(); //Returns object with new form values


###Initial data
If a form has a model attached to it, the initial values are taken from the model's defaults. Otherwise, you may pass default values using the `schema.data`.

[Back to top](#top)


<a name="form"/>
##Backbone.Form

###Options

- **`model`**

  The model to tie the form to. Calling `form.commit()` will update the model with new values.

- **`data`**

  If not using the `model` option, pass a native object through the `data` option. Then use `form.getValue()` to get the new values.

- **`schema`**

  The schema to use to create the form. Pass it in if you don't want to store the schema on the model, or to override the model schema.

- **`fieldsets`**

  An array of fieldsets descriptions. A fieldset is either a list of field names, or an object with `legend` and `fields` attributes. The `legend` will be inserted at the top of the fieldset inside a `<legend>` tag; the list of fields will be treated as `fields` is below. `fieldsets` takes priority over `fields`.

- **`fields`**

  An array of field names (keys). Only the fields defined here will be added to the form. You can also use this to re-order the fields.

- **`submitButton {String}`**

  If provided, creates a submit button at the bottom of the form using the provided text

- **`idPrefix`**

  A string that will be prefixed to the form DOM element IDs. Useful if you will have multiple forms on the same page. E.g. `idPrefix: 'user-'` will result in IDs like 'user-name', 'user-email', etc.

  If not defined, the model's CID will be used as a prefix to avoid conflicts when there are multiple instances of the form on the page. To override this behaviour, pass a null value to `idPrefix`.

- **`template`**

  The compiled template to use for generating the form.


###Events

`Backbone.Form` fires the following events:

- **`change`**

  This event is triggered whenever something happens that affects the result of `form.getValue()`.

- **`focus`**

  This event is triggered whenever this form gains focus, i.e. when the input of an editor within this form becomes the `document.activeElement`.

- **`blur`**

  This event is triggered whenever this form loses focus, i.e. when the input of an editor within this form stops being the `document.activeElement`.

- **`<key>:<event>`**

  Events fired by editors within this form will bubble up and be fired as `<key>:<event>`.

        form.on('title:change', function(form, titleEditor, extra) {
            console.log('Title changed to "' + titleEditor.getValue() + '".');
            // where extra is an array of extra arguments that
            // a custom editor might need
        });

- **`submit`**

  Fired when the form is submitted. The native Event is passed as an argument, so you can do event.preventDefault() to stop the form from submitting.

[Back to top](#top)


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
- [List](#editor-list) An editable list of items (included in a separate file: `distribution/editors/list.min.js`)



###Main attributes

For each field definition in the schema you can use the following optional attributes:

- **`type`**

  The editor to use in the field. Can be a string for any editor that has been added to `Backbone.Form.editors`, such as the built-in editors (e.g. `{ type: 'TextArea' }`), or can be a constructor function for a custom editor (e.g. : `{ type: MyEditor }`).

  If not defined, defaults to 'Text'.

- **`title`**

  Defines the text that appears in a form field's `<label>`. If not defined, defaults to a formatted version of the camelCased field key. E.g. `firstName` becomes `First Name`. This behaviour can be changed by assigning your own function to `Backbone.Form.Field.prototype.createTitle`.

  Title is escaped by default, to allow using special characters such as < and >, as well as to prevent possible XSS vulnerabilities in user generated content.

- **`titleHTML`**

  This by default will not be escaped, allowing you to use HTML tags. Will over-ride title if defined.

- **`validators`**

  A list of validators. See [Validation](#validation) for more information

- **`help`**

  Help text to add next to the editor.

- **`editorClass`**

  String of CSS class name(s) to add to the editor

- **`editorAttrs`**

  A map of attributes to add to the editor, e.g. `{ maxlength: 30, title: 'Tooltip help' }`

- **`fieldClass`**

  String of CSS class name(s) to add to the field

- **`fieldAttrs`**

  A map of attributes to add to the field, e.g. `{ style: 'background: red', title: 'Tooltip help' }`

- **`template`**

  Name of the template to use for this field. See [Customising templates](#customising-templates) for more information.

###Main events

Every editor fires the following events:

- **`change`**

  This event is triggered whenever something happens that affects the result of `editor.getValue()`.

- **`focus`**

  This event is triggered whenever this editor gains focus, i.e. when an input within this editor becomes the `document.activeElement`.

- **`blur`**

  This event is triggered whenever this editor loses focus, i.e. when an input within this editor stops being the `document.activeElement`.

Besides these three, editors can implement custom events, which are described below.

[Back to top](#top)

<a name="editor-text"/>
##Text

Creates a normal text input.

- **`dataType`**

  Changes the `type="text"` attribute. Used for HTML5 form inputs such as `url`, `tel`, `email`.  When viewing on a mobile device e.g. iOS, this will change the type of keyboard that is opened. For example, `tel` opens a numeric keypad.


<a name="editor-select"/>
##Select

Creates and populates a `<select>` element.

- **`options`**

  Options to populate the `<select>`.

  Can be any of:
    - String of HTML `<option>`s
    - Array of strings/numbers
    - An array of option groups in the form `[{group: 'Option Group Label', options: <any of the forms from this list (except the option groups)>}]`
    - Array of objects in the form `{ val: 123, label: 'Text' }`
    - A Backbone collection
    - A function that calls back with one of the above
    - An object e.g. `{ y: 'Yes', n: 'No' }`

  By default, options values and labels are escaped when rendered, to allow using special characters such as < and >, as well as to prevent possible XSS vulnerabilities in user generated content. Since Select HTML elements can't contain arbitrary HTML inside of them, there is no option on Select to NOT encode the text. Custom Editors that extend Select should factor in the possibility of labels that contain HTML.

  **Backbone collection notes**

  If using a Backbone collection as the `options` attribute, models in the collection must implement a `toString()` method. This populates the label of the `<option>`. The ID of the model populates the `value` attribute.

  If there are no models in the collection, it will be `fetch()`ed.

####Methods

- **`setOptions()`**

  Update the options in the select. Accepts any of the types that can be set in the schema `options`



####Examples

    var schema = {
        country: { type: 'Select', options: new CountryCollection() }
    };

    var schema = {
        users: { type: 'Select', options: function(callback, editor) {
            users = db.getUsers();

            callback(users);
        }}
    }

    // Option groups (each group's option can be specified differently)
    var schema = {
      options: [
        { group: 'Cities', options: ['Paris', 'Beijing']},
        { group: 'Countries', options: new Collection(objects)},
        { group: 'Food', options: '<option>Bread</option>'}
      ]
    }


<a name="editor-radio"/>
##Radio

Creates and populates a list of radio inputs. Behaves the same way and has the same options as a `Select`.

When the Radio's is given options as an array of objects, each item's `label` may be replaced with `labelHTML`. This content will not be escaped, so that HTML may be used to style the label.
If it uses object syntax, this option is not possible.

#### Example

    var schema = {
        radios: {
            type: "Radio",
            options: [
                { label: "<b>Will be escaped</b>", val: "Text is not bold, but <b> and </b> text is visible"},
                { labelHTML: "<b>Will NOT be escaped</b>", val: "Text is bold, and HTML tags are invisible"}
            ]
        }
    };

    var schema = {
        radios: {
            type: "Radio",
            options: {
                value1: "<b>Text is not bold, but <b> and </b> text is visible</b>",
                value2: "There is no way to unescape this text"
            }
        }
    };


<a name="editor-checkboxes"/>
##Checkboxes

Creates and populates a list of checkbox inputs. Behaves the same way and has the same options as a `Select`. To set defaults for this editor, use an array of values.

Checkboxes options array has the same labelHTML option as Radio.

<a name="editor-object"/>
##Object

The Object editor creates an embedded child form representing a Javascript object.

###Attributes

- **`subSchema`**

  A schema object which defines the field schema for each attribute in the object

###Events

- **`<key>:<event>`**

  Events fired by editors within this Object editor will bubble up and be fired as `<key>:<event>`.

####Examples

    var schema = {
        address: { type: 'Object', subSchema: {
            street: {},
            zip: { type: 'Number' },
            country: { 'Select', options: countries }
        }}
    };

    addressEditor.on('zip:change', function(addressEditor, zipEditor) {
        console.log('Zip changed to "' + zipEditor.getValue() + '".');
    });


<a name="editor-nestedmodel"/>
##NestedModel

Used to embed models within models.  Similar to the Object editor, but adds validation of the child form (if it is defined on the model), and keeps your schema cleaner.

###Attributes

- **`model`**

  A reference to the constructor function for your nested model. The referenced model must have it's own `schema` attribute

###Events

- **`<key>:<event>`**

  Events fired by editors within this NestedModel editor will bubble up and be fired as `<key>:<event>`.

####Examples

    var schema = {
        address: { type: 'NestedModel', model: Address }
    };

    addressEditor.on('zip:change', function(addressEditor, zipEditor) {
        console.log('Zip changed to "' + zipEditor.getValue() + '".');
    });



<a name="editor-date"/>
##Date

Creates `<select>`s for date, month and year.

- **`yearStart`**

  First year in the list. Default: 100 years ago

- **`yearEnd`**

  Last year in the list. Default: current year


####Extra options
You can customise the way this editor behaves, throughout your app:

    var editors = Backbone.Form.editors;

    editors.Date.showMonthNames = false; //Defaults to true
    editors.Date.monthNames = ['Jan', 'Feb', ...] //Defaults to full month names in English


<a name="editor-datetime"/>
##DateTime

Creates a Date editor and adds `<select>`s for time (hours and minutes).

- **`minsInterval`**

  Optional. Controls the numbers in the minutes dropdown. Defaults to 15, so it is populated with 0, 15, 30, and 45 minutes.


<a name="editor-list"/>
##List

Creates a list of items that can be added, removed and edited. Used to manage arrays of data.

This is a special editor which is in **a separate file and must be included**:

    <script src="backbone-forms/distribution/editors/list.min.js" />

###Modal Adapter

By default, the `List` editor uses modal views to render editors for `Object` or `Nested Model` item types. To use the default modal adapter, you must include the [`Backbone.BootstrapModal`](http://github.com/powmedia/backbone.bootstrap-modal) library on the page:

```html
<script src="backbone-forms/distribution/adapters/backbone.bootstrap-modal.min.js" />
```

You may also specify your own modal adapter, as long use you follow the interface of the `Backbone.BootstrapModal` class.

```js
var MyModalAdapter = Backbone.BootstrapModal.extend({
  // ...
});

Form.editors.List.Modal.ModalAdapter = MyModalAdapter;
```

If you prefer non-modal editors, you may override the default list editors like so:

```js
// Use standard 'Object' editor for list items.
Form.editors.List.Object = Form.editors.Object;

// Use standard 'NestedModel' editor for list items.
Form.editors.List.NestedModel = Form.editors.NestedModel;
```
See an editable demo of [using the Nested Model, List and Modal Adapter](https://jsfiddle.net/glenpike/wtruLbs1/19/) together.

###Attributes

- **`itemType`**

  Defines the editor that will be used for each item in the list. Similar in use to the main 'type' schema attribute. Defaults to 'Text'.

- **`confirmDelete`**

  Optional. Text to display in a delete confirmation dialog. If falsey, will not ask for confirmation.

- **`itemToString`**

  A function that returns a string representing how the object should be displayed in a list item.

  Optional, but recommended when using itemType 'Object'. When itemType is 'NestedModel', the model's `toString()` method will be used, unless a specific `itemToString()` function is defined on the schema.  If your Object keys can contain HTML, you may be vulnerable to XSS attacks ([Bug #516](https://github.com/powmedia/backbone-forms/issues/516)):

  ```js

    function itemToString(value) {
      var safeString = '';
      Object.keys(value).forEach(function(key) {
      	safeString += key + ':' + $('<div>').html(value[key]).text() + '<br/>';
      });
      
      return safeString;
    };
    
    var schema = {
        users: {
            type: 'List',
            itemType: 'Object',
            itemToString: itemToString
        }
    };
    
    ```
    See a working example [here](https://jsfiddle.net/glenpike/00vwmzmv/)

- **`itemClass`**

  A class to use instead of `List.Item`

  The default class wraps each editor in a `<div>` and adds a "delete" button on each row. Provide this argument and `List` will use your custom item class, allowing you to customize this behavior.

- **`addLabel`**

  Label of the button used to add a new item in the list. Defaults to 'Add'.

###Events

- **`add`**

  This event is triggered when a new item is added to the list.

- **`remove`**

  This event is triggered when an existing item is removed from the list.

- **`item:<event>`**

  Events fired by any item's editor will bubble up and be fired as `item:<event>`.

####Examples

    function userToName(user) {
        return user.firstName + ' ' + user.lastName;
    }

    var schema = {
        users: { type: 'List', itemType: 'Object', itemToString: userToName }
    };

    listEditor.on('add', function(listEditor, itemEditor) {
        console.log('User with first name "' + itemEditor.getValue().firstName + '" added.');
    });

    listEditor.on('item:focus', function(listEditor, itemEditor) {
        console.log('User "' + userToName(itemEditor.getValue()) + '" has been given focus.');
    });

    listEditor.on('item:lastName:change', function(listEditor, itemEditor, lastNameEditor) {
        console.log('Last name for user "' + itemEditor.getValue().firstName + '" changed to "' + lastNameEditor.getValue() +'".');
    });

[Back to top](#top)



<a name="validation"/>
##Validation

There are 2 levels of validation: schema validators and the regular
built-in Backbone model validation. Backbone Forms will run both when
`form.validate()` is called. Calling `form.commit()` will run schema
level validation by default, and can also run model validation if `{ validate: true }` is passed.

Calling `form.commit({ schemaValidate: false })` will skip schema level 
validation and allow you to write dirty form data to the model. Use with care.

###Schema validation

Validators can be defined in several ways:

- **As a string** - Shorthand for adding a built-in validator. You can add custom validators to this list by adding them to `Backbone.Form.validators`. See the source for more information.
- **As an object** - For adding a built-in validator with options, e.g. overriding the default error message.
- **As a function** - Runs a custom validation function. Each validator the following arguments: `value` and `formValues`
- **As a regular expression** - Runs the built-in `regexp` validator with a custom regular expression.

###Built-in validators

- **required**: Checks the field has been filled in.
- **number**: Checks it is a number, allowing a decimal point and negative values.
- **range**: Checks it is a number in a range defined by `min` and `max` options. Message if it is not a number can be set with the `numberMessage` option.
- **email**: Checks it is a valid email address.
- **url**: Checks it is a valid URL.
- **match**: Checks that the field matches another. The other field name must be set in the `field` option.
- **regexp**: Runs a regular expression. Requires the `regexp` option, which takes a compiled regular expression or a string value. Setting the `match` option to `false` ensures that the regexp does NOT pass.  If you set the `regexp` option to a string, it will also pass the `flags` option, if set, directly to the [RegExp constructor's 'flags' argument](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) - see below / demo.

[Built-in Validators Demo](http://jsfiddle.net/glenpike/63tj1ynk/)

####Examples

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
        
        //Regular expression with flags - if using flags, regexp must be string
        baz: {
            validators: [{
                type: 'regexp',
                regexp: 'baz',
                flags: 'i',
                message: 'Must type \'baz\' - case insensitive'
            }]
        },

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


###Customising error messages

After including the Backbone Forms file, you can override the default error messages.

{{mustache}} tags are supported; they will be replaced with the options passed into the validator configuration object. `{{value}}` is a special tag which is passed the current field value.

    Backbone.Form.validators.errMessages.required = 'Please enter a value for this field.';

    Backbone.Form.validators.errMessages.match = 'This value must match the value of {{field}}';

    Backbone.Form.validators.errMessages.email = '{{value}} is an invalid email address.';

You can also override the error message on a field by field basis by passing the `message` option in the validator config.


###Model validation

If your models have a `validate()` method the errors will be added to the error object.  To make the most of the validation system, the method should return an error object, keyed by the field object. If an unrecognised field is added, or just a string is returned, it will be added to the `_others` array of errors:

```js
var User = Backbone.Model.extend({
    validate: function(attrs) {
        var errs = {};

        if (usernameTaken(attrs.username)) errs.username = 'The username is taken'

        if !_.isEmpty(errs) return errs;
    }
})
```


###Schema validators
Forms provide a `validate` method, which returns a dictionary of errors, or `null`. Validation is determined using the `validators` attribute on the schema (see above).

If you model provides a `validate` method, then this will be called when you call `Form.validate`. Forms are also validated when you call `commit`. See the Backbone documentation for more details on model validation.

####Example

```js
//Schema definition:
var schema = {
    name: { validators: ['required'] }
}

var errors = form.commit();
```
[Back to top](#top)



<a name="customising-templates"/>
##Customising templates

Backbone-Forms comes with a few options for rendering HTML. To use another template pack, such as for [Bootstrap](http://twitter.github.com/bootstrap/), just include the .js file from the `templates` folder, after including `backbone-forms.js`.

You can change all the default templates by copying the included `distribution/templates/bootstrap.js` file and adapting that. Placeholders are the `data-xxx` attributes, e.g. `data-fieldsets`, `data-fields` and `data-editors`.


###Alternate field templates
If only certain fields need a different template this can be done by providing the template in the schema:

```js
var altFieldTemplate = _.template('<div class="altField" data-editor></div>');

var form = new Backbone.Form({
  schema: {
    age: { type: 'Number' },        //Uses the default field template
    name: { template: altFieldTemplate }  //Uses the custom template
  }
});
```


###100% custom forms
To customise forms even further you can pass in a template to the form instance or extend the form and specify the template, e.g.:

```
<script id="formTemplate" type="text/html">
    <form>
        <h1><%= heading1 %></h1>

        <h2>Name</h2>
        <div data-editors="firstName"><!-- firstName editor will be added here --></div>
        <div data-editors="lastName"><!-- lastName editor will be added here --></div>

        <h2>Password</h2>
        <div data-editors="password">
            <div class="notes">Must be at least 7 characters:</div>
            <!-- password editor will be added here -->
        </div>
    </form>
</script>
```

```js
var form = new Backbone.Form({
    template: _.template($('#formTemplate').html()),
    model: new UserModel(), //defined elsewhere
    templateData: {heading1: 'Edit profile'}
});
```

[Back to top](#top)



<a name="more"/>
##More

<a name="editors-without-forms"/>
###Editors without forms

You can add editors by themselves, without being part of a form. For example:

```js
var select = new Backbone.Form.editors.Select({
    model: user,
    key: 'country',
    options: getCountries()
}).render();

//When done, apply selection to model:
select.commit();
```

<a name="nested-fields"/>
###Using nested fields

If you are using a schema with nested attributes (using the `Object` type), you may want to include only some of the nested fields in a form. This can be accomplished by using 'path' syntax as in the example below.

However, due to Backbone's lack of support for nested model attributes, getting and setting values will not work out of the box.  For this to work as expected you must adapt your model's get() and set() methods to handle the path names, or simply use [DeepModel](http://github.com/powmedia/backbone-deep-model) which will handle paths for you automatically.

```js
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
```

The following shorthand is also valid:

```js
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
```

<a name="custom-editors"/>
###Custom editors

Writing a custom editor is simple. They must extend from Backbone.Form.editors.Base.

```js
var CustomEditor = Backbone.Form.editors.Base.extend({

    tagName: 'input',

    events: {
        'change': function() {
            // The 'change' event should be triggered whenever something happens
            // that affects the result of `this.getValue()`.
            this.trigger('change', this);
        },
        'focus': function() {
            // The 'focus' event should be triggered whenever an input within
            // this editor becomes the `document.activeElement`.
            this.trigger('focus', this);
            // This call automatically sets `this.hasFocus` to `true`.
        },
        'blur': function() {
            // The 'blur' event should be triggered whenever an input within
            // this editor stops being the `document.activeElement`.
            this.trigger('blur', this);
            // This call automatically sets `this.hasFocus` to `false`.
        }
    },

    initialize: function(options) {
        // Call parent constructor
        Backbone.Form.editors.Base.prototype.initialize.call(this, options);

        // Custom setup code.
        if (this.schema.customParam) this.doSomething();
    },

    render: function() {
        this.setValue(this.value);

        return this;
    },

    getValue: function() {
        return this.$el.val();
    },

    setValue: function(value) {
        this.$el.val(value);
    },

    focus: function() {
        if (this.hasFocus) return;

        // This method call should result in an input within this editor
        // becoming the `document.activeElement`.
        // This, in turn, should result in this editor's `focus` event
        // being triggered, setting `this.hasFocus` to `true`.
        // See above for more detail.
        this.$el.focus();
    },

    blur: function() {
        if (!this.hasFocus) return;

        this.$el.blur();
    }
});
```

**Notes:**

- The editor must implement `getValue()`, `setValue()`, `focus()` and `blur()` methods.
- The editor must fire `change`, `focus` and `blur` events.
- The original value is available through `this.value`.
- The field schema can be accessed via `this.schema`. This allows you to pass in custom parameters.



<a name="help"/>
##Help & discussion

- [Google Groups](http://groups.google.com/group/backbone-forms)


<a name="changelog"/>
##Changelog

###master
- Add ability to skip wrapping field for certain editors via the `noField` property
- Allow `fieldsets` to be defined on model (fonji)
- Add `submitButton` to form constructor. Adds a submit button with given text.
- No longer require jquery from within the CommonJS module. NOTE: You must now set Backbone.$ yourself if using CommonJS e.g. browserify
- Fix CommonJS backend issues (ndrsn)
- Added the `number` validator
- Support specifying fieldsets on the Form prototype
- Support specifying field and fieldset templates in their prototypes; allows extending Form, Field and Fieldset to create custom forms
- Support regexp validator as string (gregsabia)
- Fix bootstrap3 class list name #329
- Add 'match' option to regexp validator

###0.14.1
- Bugfix - incorrect versioning in files for 0.14.0 release - update and tag.

###0.14.0
- Add Bootstrap 3 templates (powmedia)
- Being consistent with throwing `Error`s rather than strings (philfreo)
- Save templateData when passed as an option (BradDenver)

###0.13.0
- Confirming compatibility with Backbone 1.1.0 (still supporting 1.0.0)
- Fix form.commit() to only run model-level validation if {validate:true} passed (cmaher)
- Allow for setting defaults on the prototype (patbenatar)
- Make it possible to trigger editor events with custom arguments (mvergerdelbove)
- Give checkboxes unique IDs in groups (exussum12)
- Allow passing an object to Select (lintaba)
- Add checkbox array grouping (exussum12)
- Fix checkboxes and radio 'name' attributes (#95)
- Allow field template to be defined in schema
- Fix overriding List modal templates in Bootstrap template pack
- Add ability to unset checkbox (exussum12)
- Fix change event on number field when using spinner (clearly)
- Render hidden inputs, without labels
- Remove `type` attribute from TextAreas (#261)
- Fix error when using template files without list.js (philfreo)
- Allow overriding 'step' attribute in Number editor (jarek)
- Allow most falsey values as an Editor value (ewang)

###0.12.0
- Update for Backbone 1.0
- Overhaul templating and rendering
- List: Set focus on newly added simple list items
- Select: Add option group support (khepin)

###0.11.0
- Update for Backbone 0.9.10
- Pass editor instance as second parameter to Select options function
- Fix for jQuery 1.9
- Don't show <label> if schema title===false (philfreo)
- Fix change event on radio editor (DominicBoettger)
- Fix model errors not being return by validate() (mutewinter)
- Setting value with setValue only from form.schema (okhomenko)
- Some smaller optimisation and fixes according to jsHint (MarcelloDiSimone)
- Add Form.setValue(key, val) option for arguments (lennym)
- Support ordering years in descending order in Date field (lennym)
- Allow the Number field type to accept decimal values (philfreo)
- Added 'backbone-forms' as a dependency to the AMD wrapper for templates. (seanparmelee)
- Allow use of required validator with checkbox fields (lennym)
- Make Form.Field template rendering context overrideable (drd)
- Fix a mismatched button element in the bootstrap.js template file. (there4)
- Fix AMD editors that must have backbone forms (philfreo)
- Skip undefined properties when setting form value from model.toJSON() (jgarbers)
- Add listItemTemplate option to list editors (philfreo)
- Fix NestedModel values being overridden by defaults (#99)
- Add Select.setOptions() method to change options on demand
- AMD improvements (see issue #77)
- Add 'change', 'focus' and 'blur' events (DouweM)
- Fix: #72 Hitting 'Enter' being focused on any text field in examples deletes nested "notes"
- Pressing enter in a list now adds a new item to the bottom of the list (Juice10)
- Customization of List Template & Tweaked default templates (philfreo)
- Fix not rendering of hidden fields (#75) (DouweM)
- DateTime editor:
    - Convert strings to dates
    - Remove built-in Date editor before removing self
- Email validator should accept "+" sign (#70)


###0.10.0
- update build scripts & package.json for jam packaging (dstendardi)
- Fields with options, such as Select, should handle 0 as value (torbjorntorbjorn)
- Update backbone.bootstrap-modal adapter
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
