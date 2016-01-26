;(function(Form, Editor) {

  module('Checkboxes', {
    setup: function() {
        this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
        this.sinon.restore();
    }
  });

  same = deepEqual;

  var schema = {
    options: ['Sterling', 'Lana', 'Cyril', 'Cheryl', 'Pam', 'Doctor Krieger']
  };



  test('Options as array of objects', function() {
    var editor = new Editor({
      schema: {
        options: [
          {
            val: 0,
            label: "Option 1"
          },
          {
            val: 1,
            label: "Option 2"
          },
          {
            val: 2,
            label: "Option 3"
          }
        ]
      }
    }).render();

    var checkboxes = editor.$el.find("input[type=checkbox]");
    var labels = editor.$el.find("label");

    equal(checkboxes.length, 3);
    equal(checkboxes.length, labels.length);

    equal(labels.first().html(), "Option 1");
    equal(labels.last().html(), "Option 3");

    equal(checkboxes.first().val(), "0");
    equal(checkboxes.last().val(), "2");
  });


  test('Options as array of group objects', function() {
    var editor = new Editor({
      schema: {
        options: [
          {
            group: 'North America', options: [
              { val: 'ca', label: 'Canada' },
              { val: 'us', label: 'United States' }
            ],
          },
          {
            group: 'Europe', options: [
              { val: 'es', label: 'Spain' },
              { val: 'fr', label: 'France' },
              { val: 'uk', label: 'United Kingdom' }
            ]
          }
        ]
      }
    }).render();

    var checkboxes = editor.$el.find("input[type=checkbox]");
    var labels = editor.$el.find("label");
		var fieldset = editor.$el.find("fieldset");
    var uniqueLabels = [];
    equal(checkboxes.length, 5);
    equal(checkboxes.length, labels.length);
    equal(fieldset.length, 2);
    labels.each(function(){
      if(uniqueLabels.indexOf($(this).attr('for')) == -1 )
        uniqueLabels.push($(this).attr('for'));
    });
    equal(checkboxes.length, uniqueLabels.length);

  });

  test('Default value', function() {
    var editor = new Editor({
      schema: schema
    }).render();

    var value = editor.getValue();
    equal(_.isEqual(value, []), true);
  });

  test('Custom value', function() {
    var editor = new Editor({
      value: ['Cyril'],
      schema: schema
    }).render();

    var value = editor.getValue();
    var expected = ['Cyril'];
    equal(_.isEqual(expected, value), true);
  });

  test('Throws errors if no options', function () {
      throws(function () {
          var editor = new Editor({schema: {}});
      }, /Missing required/, 'ERROR: Accepted a new Checkboxes editor with no options.');
  });

  // Value from model doesn't work here as the value must be an array.

  test('Correct type', function() {
    var editor = new Editor({
      schema: schema
    }).render();
    equal($(editor.el).get(0).tagName, 'UL');
    notEqual($(editor.el).find('input[type=checkbox]').length, 0);
  });

  test('setting value with one item', function() {
    var editor = new Editor({
      schema: schema
    }).render();

    editor.setValue(['Lana']);

    deepEqual(editor.getValue(), ['Lana']);
    equal($(editor.el).find('input[type=checkbox]:checked').length, 1);
  });

  test('setting model value with one item', function() {
    var editor = new Editor({
      schema: schema
    }).render();

    editor.setValue(['Lana']);
    editor.render();
    deepEqual(editor.getValue(), ['Lana']);
    equal($(editor.el).find('input[type=checkbox]:checked').length, 1);
  });

  test('setting value with multiple items, including a value with a space', function() {
    var editor = new Editor({
      schema: schema
    }).render();

    editor.setValue(['Lana', 'Doctor Krieger']);

    deepEqual(editor.getValue(), ['Lana', 'Doctor Krieger']);
    equal($(editor.el).find('input[type=checkbox]:checked').length, 2);
  });



  module('Checkboxes events', {
    setup: function() {
      this.sinon = sinon.sandbox.create();

      this.editor = new Editor({
        schema: schema
      }).render();

      $('body').append(this.editor.el);
    },

    teardown: function() {
      this.sinon.restore();

      this.editor.remove();
    }
  });

  test("focus() - gives focus to editor and its first checkbox", function() {
    var editor = this.editor;

    editor.focus();

    ok(editor.hasFocus);
    ok(editor.$('input[type=checkbox]').first().is(':focus'));

    editor.blur();

    stop();
    setTimeout(function() {
      start();
    }, 0);
  });

  test("focus() - triggers the 'focus' event", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.focus();

    stop();
    setTimeout(function() {
      ok(spy.called);
      ok(spy.calledWith(editor));

      editor.blur();

      setTimeout(function() {
        start();
      }, 0);
    }, 0);
  });

  test("blur() - removes focus from the editor and its focused checkbox", function() {
    var editor = this.editor;

    editor.focus();

    editor.blur();

    stop();
    setTimeout(function() {
      ok(!editor.hasFocus);
      ok(!editor.$('input[type=checkbox]').first().is(':focus'));

      start();
    }, 0);
  });

  test("blur() - triggers the 'blur' event", function() {
    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.blur();

    stop();
    setTimeout(function() {
      ok(spy.called);
      ok(spy.calledWith(editor));

      start();
    }, 0);
  });

  test("'change' event - is triggered when a checkbox is clicked", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('change', spy);

    editor.$("input[type=checkbox]").first().click();

    ok(spy.called);
    ok(spy.calledWith(editor));

    editor.$("input[type=checkbox]").val([null]);
  });

  test("'focus' event - bubbles up from checkbox when editor doesn't have focus", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.$("input[type=checkbox]").first().focus();

    ok(spy.called);
    ok(spy.calledWith(editor));

    editor.blur();

    stop();
    setTimeout(function() {
      start();
    }, 0);
  });

  test("'focus' event - doesn't bubble up from checkbox when editor already has focus", function() {
    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.$("input[type=checkbox]").focus();

    ok(!spy.called);

    editor.blur();

    stop();
    setTimeout(function() {
      start();
    }, 0);
  });

  test("'blur' event - bubbles up from checkbox when editor has focus and we're not focusing on another one of the editor's checkboxes", function() {
    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.$("input[type=checkbox]").first().blur();

    stop();
    setTimeout(function() {
      ok(spy.called);
      ok(spy.calledWith(editor));

      start();
    }, 0);
  });

  test("'blur' event - doesn't bubble up from checkbox when editor has focus and we're focusing on another one of the editor's checkboxes", function() {
    var editor = this.editor;

    editor.focus();

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.$("input[type=checkbox]:eq(0)").blur();
    editor.$("input[type=checkbox]:eq(1)").focus();

    stop();
    setTimeout(function() {
      ok(!spy.called);

      editor.blur();

      setTimeout(function() {
        start();
      }, 0);
    }, 0);
  });

  test("'blur' event - doesn't bubble up from checkbox when editor doesn't have focus", function() {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.$("input[type=checkbox]").blur();

    stop();
    setTimeout(function() {
      ok(!spy.called);

      start();
    }, 0);
  });

  module('Checkboxes Text Escaping', {
    setup: function() {
      this.sinon = sinon.sandbox.create();

      this.options = [
        {
          val: '"/><script>throw("XSS Success");</script>',
          label: '"/><script>throw("XSS Success");</script>'
        },
        {
          val: '\"?\'\/><script>throw("XSS Success");</script>',
          label: '\"?\'\/><script>throw("XSS Success");</script>',
        },
        {
          val: '><b>HTML</b><',
          label: '><div class=>HTML</b><',
        }
      ];

      this.editor = new Editor({
        schema: {
          options: this.options
        }
      }).render();

      $('body').append(this.editor.el);
    },

    teardown: function() {
      this.sinon.restore();

      this.editor.remove();
    }
  });

  test('options content gets properly escaped', function() {

    var editor = this.editor;
    var options = this.options;

    same( editor.schema.options, this.options );

    same( editor.$('script').length, 0);
    same( editor.$('b').length, 0);

    var inputs = editor.$('input');

    editor.$('label').each(function(index) {
        same( editor.$(inputs[index]).val(), options[index].val );

        same( editor.$(this).text(),  options[index].label );
        notDeepEqual( editor.$(this).html(), options[index].label );
        notEqual( editor.$(this).html().indexOf('&lt;'), -1);
    });

    same( this.editor.schema.options, this.options );

  });

  test('options object content gets properly escaped', function() {

      var options = {
        key1: '><b>HTML</b><',
        key2: '><div class=>HTML</b><'
      };

      var editor = new Editor({
        schema: {
          options: options
        }
      }).render();

    var optionKeys = _.keys(options);
    var inputs = editor.$('input');

    same( editor.schema.options, options );

    same( editor.$('b').length, 0);

    editor.$('label').each(function(index) {
        var option = options[optionKeys[index]];

        same( editor.$(inputs[index]).val(), optionKeys[index] );
        same( editor.$(this).text(),  option );
        notDeepEqual( editor.$(this).html(), option );
        notEqual( editor.$(this).html().indexOf('&lt;'), -1);
    });
  });

  test('options labels can be labelHTML, which will not be escaped', function() {

      var options = [
        {
          val: '><b>HTML</b><',
          labelHTML: '><div class=>HTML</b><',
          label: 'will be ignored'
        }
      ];

      var editor = new Editor({
        schema: {
          options: options
        }
      }).render();

    same( editor.schema.options, options );

    same( editor.$('input').val(), options[0].val );

    //Note that in these 2 results, the labelHTML has
    //been transformed because the HTML was invalid
    same( editor.$('label').first().text().trim(), '>HTML<' );
    same( editor.$('label').first().html(), '&gt;<div class=\"\">HTML&lt;</div>' );

  });

  test('option groups content gets properly escaped', function() {
    var options = [{
      group: '"/><script>throw("XSS Success");</script>',
      options: [
        {
          val: '"/><script>throw("XSS Success");</script>',
          label: '"/><script>throw("XSS Success");</script>'
        },
        {
          val: '\"?\'\/><script>throw("XSS Success");</script>',
          label: '\"?\'\/><script>throw("XSS Success");</script>',
        },
        {
          val: '><b>HTML</b><',
          label: '><div class=>HTML</b><',
        }
      ]
    }];
    var editor = new Editor({
      schema: {
        options: options
      }
    }).render();

    same( editor.schema.options, options );

    same( editor.$('script').length, 0);
    same( editor.$('b').length, 0);

    var inputs = editor.$('input');

    editor.$('label').each(function(index) {
        same( editor.$(inputs[index]).val(), options[0].options[index].val );

        same( editor.$(this).text(),  options[0].options[index].label );
        notDeepEqual( editor.$(this).html(), options[0].options[index].label );
        notEqual( editor.$(this).html().indexOf('&lt;'), -1);
    });
  });

})(Backbone.Form, Backbone.Form.editors.Checkboxes);
