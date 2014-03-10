require('./helper');
var utils = mach.utils;

describe('mach.router', function () {
  var app = mach.router();
  var innerApp = function (request) {
    var extraArgs = utils.slice(arguments, 1);

    return {
      headers: {
        'X-Args': JSON.stringify(extraArgs)
      }
    };
  };

  app.route(/\/users\/(\d+)/i, innerApp);
  app.route('/posts/:id', 'GET', innerApp);
  app.route('/posts/:id', [ 'POST', 'DELETE' ], innerApp);
  app.route('/feeds/:id.?:format?', innerApp);
  app.route('/files/*.*', innerApp);

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
      assert.ok(lastResponse.headers['X-Args']);
      assert.deepEqual(JSON.parse(lastResponse.headers['X-Args']), [ '1' ]);
    });
  });

  describe('GET /posts/1', function () {
    beforeEach(function () {
      return callApp(app, '/posts/1');
    });

    it('calls the correct app', function () {
      assert.ok(lastResponse.headers['X-Args']);
      assert.deepEqual(JSON.parse(lastResponse.headers['X-Args']), [ '1' ]);
    });
  });

  describe('POST /posts/2', function () {
    beforeEach(function () {
      return callApp(app, { method: 'POST', path: '/posts/2' });
    });

    it('calls the correct app', function () {
      assert.ok(lastResponse.headers['X-Args']);
      assert.deepEqual(JSON.parse(lastResponse.headers['X-Args']), [ '2' ]);
    });
  });

  describe('DELETE /posts/3', function () {
    beforeEach(function () {
      return callApp(app, { method: 'DELETE', path: '/posts/3' });
    });

    it('calls the correct app', function () {
      assert.ok(lastResponse.headers['X-Args']);
      assert.deepEqual(JSON.parse(lastResponse.headers['X-Args']), [ '3' ]);
    });
  });

  describe('GET /feeds/5', function () {
    beforeEach(function () {
      return callApp(app, '/feeds/5');
    });

    it('calls the correct app', function () {
      assert.ok(lastResponse.headers['X-Args']);
      assert.deepEqual(JSON.parse(lastResponse.headers['X-Args']), [ '5', null ]);
    });
  });

  describe('GET /feeds/5.html', function () {
    beforeEach(function () {
      return callApp(app, '/feeds/5.html');
    });

    it('calls the correct app', function () {
      assert.ok(lastResponse.headers['X-Args']);
      assert.deepEqual(JSON.parse(lastResponse.headers['X-Args']), [ '5', 'html' ]);
    });
  });

  describe('GET /files/feed.xml', function () {
    beforeEach(function () {
      return callApp(app, '/files/feed.xml');
    });

    it('calls the correct app', function () {
      assert.ok(lastResponse.headers['X-Args']);
      assert.deepEqual(JSON.parse(lastResponse.headers['X-Args']), [ 'feed', 'xml' ]);
    });
  });

  describe('GET /files/feed.', function () {
    beforeEach(function () {
      return callApp(app, '/files/feed.');
    });

    it('calls the correct app', function () {
      assert.ok(lastResponse.headers['X-Args']);
      assert.deepEqual(JSON.parse(lastResponse.headers['X-Args']), [ 'feed', '' ]);
    });
  });

  describe('GET /files/.xml', function () {
    beforeEach(function () {
      return callApp(app, '/files/.xml');
    });

    it('calls the correct app', function () {
      assert.ok(lastResponse.headers['X-Args']);
      assert.deepEqual(JSON.parse(lastResponse.headers['X-Args']), [ '', 'xml' ]);
    });
  });

  describe('PUT /posts/1', function () {
    beforeEach(function () {
      return callApp(app, { method: 'PUT', path: '/posts/1' });
    });

    it('returns 404', function () {
      assert.equal(lastResponse.status, 404);
    });
  });
});
