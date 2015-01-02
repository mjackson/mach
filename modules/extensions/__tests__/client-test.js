var expect = require('expect');
var mach = require('../../index');
var createStack = require('../../middleware/stack');

mach.extend(
  require('../client')
);

function echoMethod(conn) {
  return conn.method;
}

function echoRequestHeaders(_) {
  return function (conn) {
    return JSON.stringify(conn.request.headers);
  };
}

[ 'DELETE',
  'GET',
  'HEAD',
  'OPTIONS',
  'POST',
  'PUT',
  'TRACE'
].forEach(function (method) {
  var methodName = method.toLowerCase();

  describe('mach.' + methodName, function () {
    it('uses the ' + method + ' HTTP method', function () {
      expect(typeof mach[methodName]).toEqual('function');

      return mach[methodName](echoMethod).then(function (conn) {
        expect(conn.method).toEqual(method);
        expect(conn.responseText).toEqual(method);
      });
    });
  });
});

describe('mach.client', function () {

  describe('with a custom stack', function () {
    var stack;

    beforeEach(function () {
      stack = createStack();
    });

    it('allows access on the outgoing request via the stack', function () {
      stack.use(function (app) {
        return function (conn) {
          conn.request.headers['X.Test'] = 'Test Value'; 
          return app(conn);
        };
      });
      stack.use(echoRequestHeaders);

      return mach.get(stack, 'http://example.com/foo').then(function (conn) {
        expect(conn.method).toEqual('GET');
        expect(JSON.parse(conn.responseText)['X.Test']).toEqual('Test Value');
      });
    });

    it('allows access on the outgoing request via a modifier', function () {
      stack.use(echoRequestHeaders);

      return mach.get(stack, 'http://example.com/foo', function (conn) {
        conn.request.headers['X.Test'] = 'from modifier';
      }).then(function (conn) {
        expect(JSON.parse(conn.responseText)['X.Test']).toEqual('from modifier');

        // it doesn't keep the function as part of the stack
        return mach.get(stack, 'http://example.com/foo').then(function (conn2) {
          expect(JSON.parse(conn2.responseText)['X.Test']).toBe(undefined);
        });
      });
    });

    it('lets me set the body on a post request', function () {
      stack.use(function (app) {
        return function (conn) { conn.response.content = conn.request.content; };
      });

      return mach.post(stack, 'http://foo.bar', function (conn) {
        conn.request.content = "Here Yo";
      }).then(function (conn) {
        expect(conn.responseText).toEqual('Here Yo');
      });
    });
  });

});
