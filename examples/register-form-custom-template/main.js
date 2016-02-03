$(function() {
  //Extend Backbone.Form and customise, set schema
  var RegisterForm = Backbone.Form.extend({

    template: _.template($('#formTemplate').html()),

    schema: {
      title: {
        type: 'Select', options: ['Mr', 'Mrs', 'Ms']
      },
      name: {
        validators: ['required']
      },
      birthday: {
        type: 'Date'
      },
      email: {
        validators: ['required', 'email']
      },
      password: {
        type: 'Password',
        validators: ['required']
      },
      confirmPassword: {
        type: 'Password',
        validators: [
          'required',
          { type: 'match', field: 'password', message: 'Passwords must match!' }
        ]
      },
      active: {
        type: 'Checkbox'
      }
    }
    
  });

  //Create the form instance and add to the page
  var form = new RegisterForm().render();

  $('body').append(form.el);


  //Run validation before submitting
  form.on('submit', function(event) {
    var errs = form.validate();

    if (errs) event.preventDefault();
  });

});