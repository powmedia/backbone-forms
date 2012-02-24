;(function() {

  module('required')
  
  var required = Form.validators.required,
      errMsg = 'required'

  test('error if field is null or undefined', function() {
    equal(required(null), errMsg)
    equal(required(), errMsg)
  })
  
  test('error if field is empty string', function() {
    equal(required(''), errMsg)
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
  
  var fn = Form.validators.regexp,
      errMsg = 'regexp'

  test('passes empty values', function() {
    equal(fn('', { regexp: /foo/ }), undefined)
    equal(fn(null, { regexp: /foo/ }), undefined)
    equal(fn(undefined, { regexp: /foo/ }), undefined)
  })

})();


;(function() {
  module('email')
  
  var fn = Form.validators.email,
      errMsg = 'email'
  
  test('passes empty values', function() {
    equal(fn('', { regexp: /foo/ }), undefined)
    equal(fn(null, { regexp: /foo/ }), undefined)
    equal(fn(undefined, { regexp: /foo/ }), undefined)
  })
  
  test('accepts valid emails', function() {
    equal(fn('invalid'), errMsg)
    equal(fn('email@example'), errMsg)
    equal(fn('foo/bar@example.com'), errMsg)
    equal(fn('foo?bar@example.com'), errMsg)
    equal(fn('foo@exa#mple.com'), errMsg)
    equal(fn(234), errMsg)
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
  
  var fn = Form.validators.url,
      errMsg = 'url'
  
  test('passes empty values', function() {
    equal(fn('', { regexp: /foo/ }), undefined)
    equal(fn(null, { regexp: /foo/ }), undefined)
    equal(fn(undefined, { regexp: /foo/ }), undefined)
  })
  
  test('accepts valid urls', function() {
    equal(fn('invalid'), errMsg)
    equal(fn('example.com'), errMsg)
    equal(fn('www.example.com'), errMsg)
    equal(fn('htp://example.com'), errMsg)
    equal(fn('http://example'), errMsg)
    equal(fn(234), errMsg)
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
