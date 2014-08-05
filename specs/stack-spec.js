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

  app.get('/home', function (request) {
    return 'welcome home!';
  });

  app.use(addHeader, 'Three');

  describe('a request that does not match any mappings or routes', function () {
    beforeEach(function () {
      return callApp(app, '/');
    });

    it('calls all middleware', function () {
      assert(lastResponse.headers['One']);
      assert(lastResponse.headers['Two']);
      assert(lastResponse.headers['Three']);
    });
  });

  describe('a request that matches a location in front of some middleware', function () {
    beforeEach(function () {
      return callApp(app, '/images');
    });

    it('calls all middleware in front of that location', function () {
      assert(lastResponse.headers['One']);
      assert(lastResponse.headers['Two']);
    });

    it('does not call any middleware after that location', function () {
      refute(lastResponse.headers['Three']);
    });
  });

  describe('a request that matches a route in front of some middleware', function () {
    beforeEach(function () {
      return callApp(app, '/home');
    });

    it('calls all middlware in front of that route', function () {
      assert(lastResponse.headers['One']);
      assert(lastResponse.headers['Two']);
    });

    it('does not call middleware after that route', function () {
      refute(lastResponse.headers['Three']);
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
