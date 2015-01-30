var expect = require('expect');
var mach = require('../../index');

function echoMethod(conn) {
  return conn.method;
}

describe('extensions/client', function () {

  beforeEach(function () {
    mach.extend(require('../client'));
  });

  describe('mach.call', function () {
    it('is a function', function () {
      expect(mach.call).toBeA('function');
    });

    it('uses the GET HTTP method by default', function () {
      return mach.call(echoMethod).then(function (conn) {
        expect(conn.method).toEqual('GET');
        expect(conn.responseText).toEqual('GET');
      });
    });
  });

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
      it('is a function', function () {
        expect(mach[methodName]).toBeA('function');
      });

      it('uses the ' + method + ' HTTP method', function () {
        return mach[methodName](echoMethod).then(function (conn) {
          expect(conn.method).toEqual(method);
          expect(conn.responseText).toEqual(method);
        });
      });
    });
  });

});


// TODO: Put these somewhere else.

// var createStack = require('../../middleware/stack');
// mach.extend(
//   require('../client')
// );

// function echoRequestHeaders(_) {
//   return function (conn) {
//     return JSON.stringify(conn.request.headers);
//   };
// }

// describe('mach.client', function () {

//   describe('with a custom stack', function () {
//     var stack;

//     beforeEach(function () {
//       stack = createStack();
//     });

//     it('allows access on the outgoing request via the stack', function () {
//       stack.use(function (app) {
//         return function (conn) {
//           conn.request.headers['X.Test'] = 'Test Value'; 
//           return app(conn);
//         };
//       });
//       stack.use(echoRequestHeaders);

//       return mach.get(stack, 'http://example.com/foo').then(function (conn) {
//         expect(conn.method).toEqual('GET');
//         expect(JSON.parse(conn.responseText)['X.Test']).toEqual('Test Value');
//       });
//     });

//     it('allows access on the outgoing request via a modifier', function () {
//       stack.use(echoRequestHeaders);

//       return mach.get(stack, 'http://example.com/foo', function (conn) {
//         conn.request.headers['X.Test'] = 'from modifier';
//       }).then(function (conn) {
//         expect(JSON.parse(conn.responseText)['X.Test']).toEqual('from modifier');

//         // it doesn't keep the function as part of the stack
//         return mach.get(stack, 'http://example.com/foo').then(function (conn2) {
//           expect(JSON.parse(conn2.responseText)['X.Test']).toBe(undefined);
//         });
//       });
//     });

//     it('lets me set the body on a post request', function () {
//       stack.use(function (app) {
//         return function (conn) { conn.response.content = conn.request.content; };
//       });

//       return mach.post(stack, 'http://foo.bar', function (conn) {
//         conn.request.content = "Here Yo";
//       }).then(function (conn) {
//         expect(conn.responseText).toEqual('Here Yo');
//       });
//     });
//   });

// });
