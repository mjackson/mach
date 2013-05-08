require('./helper');

describe('mach.stack', function () {
  var app = mach.stack();

  app.use(addHeader, 'One');
  app.use(addHeader, 'Two');

  app.map('/images', function (app) {
    app.run(function (request) {
      return 'an image';
    });
  });

  app.use(addHeader, 'Three');

  describe('when a request is received', function () {
    beforeEach(function () {
      return callApp(app, '/');
    });

    it('calls all middleware', function () {
      assert(lastResponse.headers['One']);
      assert(lastResponse.headers['Two']);
      assert(lastResponse.headers['Three']);
    });
  });

  describe('when the request matches a location that is in front of some middleware', function () {
    beforeEach(function () {
      return callApp(app, '/images');
    });

    it('calls all middleware in front of that location, but none after', function () {
      assert(lastResponse.headers['One']);
      assert(lastResponse.headers['Two']);
    });

    it("doesn't call any middleware after that location", function () {
      assert(!lastResponse.headers['Three']);
    });
  });
});

function addHeader(app, headerName) {
  return function (request) {
    return request.call(app).then(function (response) {
      response.headers[headerName] = '1';
      return response;
    });
  };
}
