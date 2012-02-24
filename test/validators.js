;(function() {

  module('required')
  
  var required = Form.validators.required()

  test('error if field is null or undefined', function() {
    ok(required(null))
    ok(required())
  })
  
  test('error if field is empty string', function() {
    ok(required(''))
    equal(required('test', undefined))
  })
  
  test('ok if field is number 0', function() {
    equal(required(0), undefined)
  })
  
  test('ok if field is boolean', function() {
    equal(required(false), undefined)
    equal(required(true), undefined)
  })

})();


;(function() {

  module('regexp')
  
  var fn = Form.validators.regexp()

  test('passes empty values', function() {
    equal(fn('', { regexp: /foo/ }), undefined)
    equal(fn(null, { regexp: /foo/ }), undefined)
    equal(fn(undefined, { regexp: /foo/ }), undefined)
  })

})();


;(function() {
  module('email')
  
  var fn = Form.validators.email()
  
  test('passes empty values', function() {
    equal(fn('', { regexp: /foo/ }), undefined)
    equal(fn(null, { regexp: /foo/ }), undefined)
    equal(fn(undefined, { regexp: /foo/ }), undefined)
  })
  
  test('accepts valid emails', function() {
    ok(fn('invalid'))
    ok(fn('email@example'))
    ok(fn('foo/bar@example.com'))
    ok(fn('foo?bar@example.com'))
    ok(fn('foo@exa#mple.com'))
    ok(fn(234))
  })
  
  test('fails invalid emails', function() {
    equal(fn('test@example.com'), undefined)
    equal(fn('john.smith@example.com'), undefined)
    equal(fn('john.smith@example.co.uk'), undefined)
    equal(fn('john-smith@example.com'), undefined)
  })
  
})();


;(function() {
  module('url')
  
  var fn = Form.validators.url()
  
  test('passes empty values', function() {
    equal(fn('', { regexp: /foo/ }), undefined)
    equal(fn(null, { regexp: /foo/ }), undefined)
    equal(fn(undefined, { regexp: /foo/ }), undefined)
  })
  
  test('accepts valid urls', function() {
    ok(fn('invalid'))
    ok(fn('example.com'))
    ok(fn('www.example.com'))
    ok(fn('htp://example.com'))
    ok(fn('http://example'))
    ok(fn(234))
  })
  
  test('fails invalid url', function() {
    equal(fn('http://example.com'), undefined)
    equal(fn('http://example.co.uk'), undefined)
    equal(fn('http://www.example.com'), undefined)
    equal(fn('http://subdomain.domain.co.uk'), undefined)
    equal(fn('http://example.com/path'), undefined)
    equal(fn('http://www.example.com/path/1/2'), undefined)
    equal(fn('http://www.example.com/path/1/2?q=str'), undefined)
  })
  
})();
