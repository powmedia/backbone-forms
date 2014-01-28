require.config( {
  baseUrl: './lib',
  paths: {
    'backbone-forms': '../../../distribution/backbone-forms'
  }
});

define(['backbone-forms'], function(Form) {
  var form = new Form({
    schema: {
      name: 'Text'
    }
  });

  $('body').append(form.render().el);
});
