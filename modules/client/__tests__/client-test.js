var expect = require('expect');
var mach = require('../index');

function echoMethod(conn) {
  return conn.method;
}

function echoRequestHeaders(_) {
  return function (conn) {
    return conn.json(conn.request.headers);
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

describe('mach.client', function () {

  it('may be used with an options object as the first argument', function () {
    // This test may take a while because it makes a real network connection.
    this.timeout(3000);

    return mach.get({
      url: 'http://example.org'
    }).then(function (conn) {
      console.log(conn.status, conn.response.headers);
      expect(conn.hostname).toEqual('example.org');
    });
  });

  describe('with a custom stack', function () {
    var stack;

    beforeEach(function () { stack = mach.stack(); });
    afterEach(function () { stack = null; });

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
        return mach.get(stack, 'http://example.com/foo')
        .then(function (conn2) {
          expect(JSON.parse(conn2.responseText)['X.Test']).toEqual(undefined);
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
