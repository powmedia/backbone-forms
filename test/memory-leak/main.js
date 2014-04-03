$(function() {
  var TestForm = Backbone.Form.extend({

    template: _.template($('#formTemplate').html()),

    templateData: function() {
      return { number: this.options.number };
    },

    schema: {
      title: { type: 'Select', options: ['Mr', 'Mrs', 'Ms'] },
      name: 'Text',
      birthday: 'Date',
      email: 'Text',
      password: 'Password'
    }
    
  });

  
  var forms = window.forms = [];


  function createForm() {
    var form = new TestForm({
      templateData: {
        number: forms.length + 1
      }
    }).render();

    forms.push(form);

    $('body').append(form.el);
  }

  function removeForm() {
    var form = forms.shift();

    form.remove();
  }


  $('.create').click(function() {
    var number = parseInt($('input.number').val(), 10);

    _.times(number, createForm);
  });

  $('.remove').click(removeForm);

  $('.remove-all').click(function() {
    for (var i = 0, len = forms.length; i < len; i++) {
      removeForm();
    }
  });

});