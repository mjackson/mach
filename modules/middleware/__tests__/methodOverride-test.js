var expect = require('expect');
var callApp = require('../../utils/callApp');
var methodOverride = require('../methodOverride');
var params = require('../params');

describe('middleware/methodOverride', function () {
  var app = methodOverride(function (conn) {
    return conn.method;
  });

  describe('when the request method is given in a request parameter', function () {
    describe('and the params middleware is in front', function () {
      it('sets the request method', function () {
        return callApp(params(app), {
          params: { '_method': 'PUT' }
        }).then(function (conn) {
          expect(conn.responseText).toEqual('PUT');
        });
      });
    });

    describe('but the params middleware is not in front', function () {
      var errors, errorHandler;
      beforeEach(function () {
        errors = [];
        errorHandler = function (error) {
          errors.push(error);
        };
      });

      it('does not set the request method and generates an error', function () {
        return callApp(app, {
          params: { '_method': 'PUT' },
          onError: errorHandler
        }).then(function (conn) {
          expect(conn.responseText).toEqual('GET');
          expect(errors.length).toEqual(1);
          expect(errors[0].message).toEqual('No params! Use mach.params in front of mach.methodOverride');
        });
      });
    });
  });

  describe('when the request method is given in a request parameter with multiple values', function () {
    describe('and the params middleware is in front', function () {
      it('sets the request method to the last given value', function () {
        return callApp(params(app), {
          params: { '_method': [ 'PUT', 'DELETE' ] }
        }).then(function (conn) {
          expect(conn.responseText).toEqual('DELETE');
        });
      });
    });
  });

  describe('when the request method is given in an HTTP header', function () {
    it('sets the request method', function () {
      return callApp(app, {
        headers: { 'X-Http-Method-Override': 'PUT' }
      }).then(function (conn) {
        expect(conn.responseText).toEqual('PUT');
      });
    });
  });
});
