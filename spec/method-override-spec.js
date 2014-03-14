require('./helper');
var makeParams = mach.params;

describe('methodOverride', function () {
  var app = mach.methodOverride(function (request) {
    return request.method;
  });

  describe('when the request method is given in a request parameter', function () {
    describe('and the params middleware is in front', function () {
      var innerApp = makeParams(app);

      beforeEach(function () {
        return callApp(innerApp, {
          params: { '_method': 'PUT' }
        });
      });

      it('sets the request method', function () {
        expect(lastResponse.buffer).toEqual('PUT');
      });
    });

    describe('but the params middleware is not in front', function () {
      var error;
      beforeEach(function () {
        error = {};
        return callApp(app, {
          params: { '_method': 'PUT' },
          error: fakeStream(error)
        });
      });

      it('does not set the request method', function () {
        expect(lastResponse.buffer).toEqual('GET');
      });

      it('writes to the error stream', function () {
        expect(error.data).toEqual('No request params. Use mach.params in front of mach.methodOverride\n');
      });
    });
  });

  describe('when the request method is given in a request parameter with multiple values', function () {
    describe('and the params middleware is in front', function () {
      var innerApp = makeParams(app);

      beforeEach(function () {
        return callApp(innerApp, {
          params: { '_method': [ 'PUT', 'DELETE' ] }
        });
      });

      it('sets the request method to the last given value', function () {
        expect(lastResponse.buffer).toEqual('DELETE');
      });
    });
  });

  describe('when the request method is given in an HTTP header', function () {
    beforeEach(function () {
      return callApp(app, {
        headers: { 'X-Http-Method-Override': 'PUT' }
      });
    });

    it('sets the request method', function () {
      expect(lastResponse.buffer).toEqual('PUT');
    });
  });
});
