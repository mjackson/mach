var expect = require('expect');
var mach = require('../index');

function echoMethod(conn) {
  return conn.method;
}

[ 'DELETE',
  'GET',
  'HEAD',
  'OPTIONS',
  'POST',
  'PUT',
  'TRACE'
].forEach(function (method) {
  var propertyName = method.toLowerCase();

  describe('mach.' + propertyName, function () {
    it('uses the ' + method + ' HTTP method', function () {
      expect(typeof mach[propertyName]).toEqual('function');

      return mach[propertyName](echoMethod).then(function (conn) {
        expect(conn.method).toEqual(method);
        expect(conn.responseText).toEqual(method);
      });
    });
  });
});
