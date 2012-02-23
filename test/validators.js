(function() {

  module('required')
  
  var required = Form.validators.required

  test('error if field is null or undefined', function() {
    equal(required(null), 'required')
    equal(required(), 'required')
  })
  
  test('error if field is empty string', function() {
    equal(required(''), 'required')
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