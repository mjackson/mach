require('./helper');
var router = mach.router;

describe('mach.router', function () {
  var app = router();

  var innerApp = function (env, callback) {
    var route = env.route;
    assert.ok(route);
    return {
      headers: {
        'X-Route': JSON.stringify(route),
        'X-Id': String(route.id)
      }
    };
  };

  app.route(/\/users\/(\d+)/i, innerApp);
  app.route('/posts/:id', innerApp, 'GET');
  app.route('/posts/:id', innerApp, ['POST', 'DELETE']);

  describe('when a match cannot be made', function () {
    beforeEach(function () {
      return callApp(app, '/');
    });

    it('returns 404', function () {
      assert.equal(lastResponse.status, 404);
    });
  });

  describe('GET /users/1', function () {
    beforeEach(function () {
      return callApp(app, '/users/1');
    });

    it('calls the correct app', function () {
      assert.ok(lastResponse.headers['X-Route']);
      assert.deepEqual(JSON.parse(lastResponse.headers['X-Route']), ['/users/1', '1']);
    });

    it('does not set the id route parameter', function () {
      assert.ok(lastResponse.headers['X-Id']);
      assert.equal(lastResponse.headers['X-Id'], 'undefined');
    });
  });

  describe('GET /posts/1', function () {
    beforeEach(function () {
      return callApp(app, '/posts/1');
    });

    it('calls the correct app', function () {
      assert.ok(lastResponse.headers['X-Route']);
      assert.deepEqual(JSON.parse(lastResponse.headers['X-Route']), ['/posts/1', '1']);
    });

    it('sets the id route parameter', function () {
      assert.ok(lastResponse.headers['X-Id']);
      assert.equal(lastResponse.headers['X-Id'], '1');
    });
  });

  describe('POST /posts/2', function () {
    beforeEach(function () {
      return callApp(app, { method: 'POST', path: '/posts/2' });
    });

    it('calls the correct app', function () {
      assert.ok(lastResponse.headers['X-Route']);
      assert.deepEqual(JSON.parse(lastResponse.headers['X-Route']), ['/posts/2', '2']);
    });

    it('sets the id route parameter', function () {
      assert.ok(lastResponse.headers['X-Id']);
      assert.equal(lastResponse.headers['X-Id'], '2');
    });
  });

  describe('DELETE /posts/3', function () {
    beforeEach(function (callback) {
      return callApp(app, { method: 'DELETE', path: '/posts/3' });
    });

    it('calls the correct app', function () {
      assert.ok(lastResponse.headers['X-Route']);
      assert.deepEqual(JSON.parse(lastResponse.headers['X-Route']), ['/posts/3', '3']);
    });

    it('sets the id route parameter', function () {
      assert.ok(lastResponse.headers['X-Id']);
      assert.equal(lastResponse.headers['X-Id'], '3');
    });
  });

  describe('PUT /posts/1', function () {
    beforeEach(function (callback) {
      return callApp(app, { method: 'PUT', path: '/posts/1' });
    });

    it('returns 404', function () {
      assert.equal(lastResponse.status, 404);
    });
  });
});
