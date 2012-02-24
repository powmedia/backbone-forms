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
  module('email')
  
  var email = Form.validators.email,
      errMsg = 'email'
  
  test('passes empty string', function() {
    equal(email(''), undefined)
  })
  
  test('accepts valid emails', function() {
    equal(email('invalid'), errMsg)
    equal(email('email@example'), errMsg)
    equal(email('foo/bar@example.com'), errMsg)
    equal(email('foo?bar@example.com'), errMsg)
    equal(email('foo@exa#mple.com'), errMsg)
    equal(email(234), errMsg)
  })
  
  test('fails invalid emails', function() {
    equal(email('test@example.com'), undefined)
    equal(email('john.smith@example.com'), undefined)
    equal(email('john.smith@example.co.uk'), undefined)
    equal(email('john-smith@example.com'), undefined)
  })
  
})();


;(function() {
  module('url')
  
  var url = Form.validators.url,
      errMsg = 'url'
  
  test('passes empty string', function() {
    equal(url(''), undefined)
  })
  
  test('accepts valid urls', function() {
    equal(url('invalid'), errMsg)
    equal(url('example.com'), errMsg)
    equal(url('www.example.com'), errMsg)
    equal(url('htp://example.com'), errMsg)
    equal(url('http://example'), errMsg)
    equal(url(234), errMsg)
  })
  
  test('fails invalid url', function() {
    equal(url('http://example.com'), undefined)
    equal(url('http://example.co.uk'), undefined)
    equal(url('http://www.example.com'), undefined)
    equal(url('http://subdomain.domain.co.uk'), undefined)
    equal(url('http://example.com/path'), undefined)
    equal(url('http://www.example.com/path/1/2'), undefined)
    equal(url('http://www.example.com/path/1/2?q=str'), undefined)
  })
  
})();
