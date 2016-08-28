;(function(Form, Field, editors) {



;(function() {

  module('general')

  test('can change default error messages with mustache tags', function() {
    var originalMessage = Form.validators.errMessages.email;

    Form.validators.errMessages.email = _.template('<%= value %> is an invalid email address. <%= customTag %>.', null, Form.templateSettings);

    var email = Form.validators.email({ customTag: 'Cool beans' })
    equal(email('foo').message, 'foo is an invalid email address. Cool beans.')

    //Restore original message
    Form.validators.errMessages.email = originalMessage;
  })

})();


;(function() {

  module('required')

  var required = Form.validators.required()

  test('error if field is null or undefined or false', function() {
    ok(required(null))
    ok(required())
    ok(required(false))
  })

  test('error if field is a string that contains only whitespace', function() {
    ok(required(" "))
    ok(required("  "))
    ok(required(" "))
    ok(required("   "))
  })

  test('error if field is empty string', function() {
    ok(required(''))
    equal(required('test', undefined))
  })

  test('ok if field is number 0', function() {
    equal(required(0), undefined)
  })

  test('ok if field is boolean true', function() {
    equal(required(true), undefined)
  })

  test('ok if field is string', function() {
    equal(required('test'), undefined)
    equal(required(' test'), undefined)
    equal(required('test '), undefined)
    equal(required(' test '), undefined)
  })

  test('required uses Backbone.$ not global #519', function() {
    var old$ = window.$;

    window.$ = null;

    ok(required("   "))

    window.$ = old$;
  })

})();


;(function() {

  module('regexp')

  //Main
  var fn = Form.validators.regexp({
    regexp: /foo/
  });

  test('passes empty values', function() {
    equal(fn(''), undefined)
    equal(fn(null), undefined)
    equal(fn(undefined), undefined)
  })

  test('fails invalid strings', function() {
    equal(fn('gsurkbfsr').type, 'regexp')
    equal(fn('guerbayf').message, 'Invalid')
  })

  test('passes valid strings', function() {
    equal(fn('foo'), undefined)
    equal(fn('_foo_'), undefined)
  })

  //regexp as string
  test('fails string input', function() {
    var fn = Form.validators.regexp({
      regexp : '^(foo|bar)$',
      flags : 'i'
    });

    equal(fn(''), undefined)
    equal(fn('food').type, 'regexp')
    equal(fn('food').message, 'Invalid')
    equal(fn('bars').type, 'regexp')
    equal(fn('bars').message, 'Invalid')
  })

  test('passes string input', function() {
    var fn = Form.validators.regexp({
      regexp : '^(foo|bar)$',
      flags : 'i'
    });

    equal(fn('foo'), undefined)
    equal(fn('bar'), undefined)
  })


  //match option
  test('passes valid strings with match=true', function() {
    var fn = Form.validators.regexp({
      regexp: /foo/,
      match: true
    });

    equal(fn('foo'), undefined)
  });

  test('fails strings with match=true', function() {
    var fn = Form.validators.regexp({
      regexp: /foo/,
      match: true
    });

    equal(fn('bar').message, 'Invalid')
  });

  test('passes valid strings with match=false', function() {
    var fn = Form.validators.regexp({
      regexp: /foo/,
      match: false
    });

    equal(fn('foo').message, 'Invalid');
  });

  test('fails strings with match=false', function() {
    var fn = Form.validators.regexp({
      regexp: /foo/,
      match: false
    });

    equal(fn('bar'), undefined);
  });

})();


;(function() {
  module('number')

  var fn = Form.validators.number()

  test('passes empty values', function() {
    equal(fn(''), undefined)
    equal(fn(null), undefined)
    equal(fn(undefined), undefined)
  })

  test('fails non-number values', function() {
    ok(fn('foo'))
    ok(fn('123a'))
    ok(fn('-.'))
    ok(fn('5.'))
  })

  test('accepts numbers', function() {
    equal(fn('123'), undefined)
    equal(fn(456), undefined)
    equal(fn(123.3), undefined)
    equal(fn('123.5'), undefined)
    equal(fn('-123.5'), undefined)
    equal(fn(-123.5), undefined)
    equal(fn('.5'), undefined)
    equal(fn(0.5), undefined)
  })

})();


;(function() {
  module('range')

  var fn = Form.validators.range()

  test('passes empty values', function() {
    equal(fn(''), undefined)
    equal(fn(null), undefined)
    equal(fn(undefined), undefined)
  })

  test('fails non-number values', function() {
    ok(fn('foo'))
    ok(fn('123a'))
  })

  test('accepts numbers in range', function() {
    equal(fn('12'), undefined)
    equal(fn(45), undefined)
    equal(fn(13.3), undefined)
    equal(fn('23.5'), undefined)
  })

  test('fails numbers out of range', function() {
    ok(fn('123'))
    ok(fn(456))
    ok(fn('-1'))
    ok(fn(-2))
  })

})();


;(function() {
  module('email')

  var fn = Form.validators.email()

  test('passes empty values', function() {
    equal(fn(''), undefined)
    equal(fn(null), undefined)
    equal(fn(undefined), undefined)
  })

  test('fails invalid emails', function() {
    ok(fn('invalid'))
    ok(fn('email@example'))
    ok(fn('foo@exa#mple.com'))
    ok(fn(234))
    ok(fn('#@%^%#$@#$@#.com'))
    ok(fn('@domain.com'))
    ok(fn('Joe Smith <email@domain.com>'))
    ok(fn('email.domain.com'))
    ok(fn('email@domain@domain.com'))
    ok(fn('.email@domain.com'))
    ok(fn('email.@domain.com'))
    ok(fn('email..email@domain.com'))
    ok(fn('あいうえお@domain.com'))
    ok(fn('email@domain.com (Joe Smith)'))
    ok(fn('email@-domain.com'))
    //ok(fn('email@domain.web')) //@todo: validate TLD
    //ok(fn('email@111.222.333.44444')) //@todo: check for valid IP
    ok(fn('email@domain..com'))
  })

  test('accepts valid emails', function() {
    equal(fn('foo/bar@example.com'), undefined)
    equal(fn('foo?bar@example.com'), undefined)
    equal(fn('test@example.com'), undefined)
    equal(fn('john.smith@example.com'), undefined)
    equal(fn('john.smith@example.co.uk'), undefined)
    equal(fn('john-smith@example.com'), undefined)
    equal(fn('john+smith@example.com'), undefined)
    equal(fn('john\'s.email@example.com'), undefined)
    equal(fn('email@123.123.123.123'), undefined)
    equal(fn('1234567890@domain.com'), undefined)
    equal(fn('email@domain-one.com'), undefined)
    equal(fn('_______@domain.com'), undefined)
    equal(fn('email@domain.name'), undefined)
  })

})();


;(function() {
  module('url')

  var fn = Form.validators.url()

  test('passes empty values', function() {
    equal(fn(''), undefined)
    equal(fn(null), undefined)
    equal(fn(undefined), undefined)
  })

  test('fails invalid url', function() {
    ok(fn('invalid'))
    ok(fn('.example.com'))
    ok(fn('htp://example.com'))
    ok(fn('http://example'))
    ok(fn(234))
  })

  test('accepts valid urls', function() {
    equal(fn('example.com'))
    equal(fn('www.example.com'))
    equal(fn('http://example.com'), undefined)
    equal(fn('http://example.co.uk'), undefined)
    equal(fn('http://www.example.com'), undefined)
    equal(fn('http://www.example.com:8081'), undefined)
    equal(fn('http://subdomain.domain.co.uk'), undefined)
    equal(fn('http://example.com/path'), undefined)
    equal(fn('http://www.example.com/path/1/2'), undefined)
    equal(fn('http://www.example.com/path/1/2?q=str'), undefined)
  })

})();


;(function() {
  module('match')

  var fn = Form.validators.match({
    field: 'confirm'
  });

  test('passes empty values', function() {
    equal(fn(''), undefined)
    equal(fn(null), undefined)
    equal(fn(undefined), undefined)
  })

  test('accepts when fields match', function() {
    var attrs = {
      password: 'foo',
      confirm: 'foo'
    };

    equal(fn('foo', attrs), undefined)
  })

  test('fails when fields dont match', function() {
    var attrs = {
      password: 'foo',
      confirm: 'bar'
    };

    var err = fn('foo', attrs)

    equal(err.type, 'match')
    equal(err.message, 'Must match field "confirm"')
  })
})();



})(Backbone.Form, Backbone.Form.Field, Backbone.Form.editors);
