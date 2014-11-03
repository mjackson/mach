require('./helper');

var UNDEF = '__UNDEFINED__';

function stringifyParams(request) {
  return JSON.stringify(request.params, function (key, value) {
    if (value === undefined)
      return UNDEF; // so we can test for undefined

    return value;
  });
}

function lastParams() {
  assert(lastResponse.buffer);
  return JSON.parse(lastResponse.buffer);
}

describe('mach.router', function () {
  var app = mach.router();

  app.route('/posts/:id', 'GET', stringifyParams);
  app.route('/posts/:id', [ 'POST', 'DELETE' ], stringifyParams);
  app.route('/feeds/:id.?:format?', stringifyParams);
  app.route('/files/*.*', stringifyParams);
  app.route(/\/users\/(\d+)/i, stringifyParams);

  describe('when a match cannot be made', function () {
    beforeEach(function () {
      return callApp(app, '/');
    });

    it('returns 404', function () {
      expect(lastResponse.status).toEqual(404);
    });
  });

  describe('GET /posts/1', function () {
    beforeEach(function () {
      return callApp(app, '/posts/1');
    });

    it('has the correct params', function () {
      expect(lastParams()).toEqual({ id: '1' });
    });
  });

  describe('POST /posts/2', function () {
    beforeEach(function () {
      return callApp(app, { method: 'POST', path: '/posts/2' });
    });

    it('has the correct params', function () {
      expect(lastParams()).toEqual({ id: '2' });
    });
  });

  describe('DELETE /posts/3', function () {
    beforeEach(function () {
      return callApp(app, { method: 'DELETE', path: '/posts/3' });
    });

    it('has the correct params', function () {
      expect(lastParams()).toEqual({ id: '3' });
    });
  });

  describe('GET /feeds/5', function () {
    beforeEach(function () {
      return callApp(app, '/feeds/5');
    });

    it('has the correct params', function () {
      expect(lastParams()).toEqual({ id: '5', format: UNDEF });
    });
  });

  describe('GET /feeds/5.html', function () {
    beforeEach(function () {
      return callApp(app, '/feeds/5.html');
    });

    it('has the correct params', function () {
      expect(lastParams()).toEqual({ id: '5', format: 'html' });
    });
  });

  describe('GET /files/feed.xml', function () {
    beforeEach(function () {
      return callApp(app, '/files/feed.xml');
    });

    it('has the correct params', function () {
      expect(lastParams()).toEqual({ splat: [ 'feed', 'xml' ] });
    });
  });

  describe('GET /files/feed.', function () {
    beforeEach(function () {
      return callApp(app, '/files/feed.');
    });

    it('has the correct params', function () {
      expect(lastParams()).toEqual({ splat: [ 'feed', '' ] });
    });
  });

  describe('GET /files/.xml', function () {
    beforeEach(function () {
      return callApp(app, '/files/.xml');
    });

    it('has the correct params', function () {
      expect(lastParams()).toEqual({ splat: [ '', 'xml' ] });
    });
  });

  describe('PUT /posts/1', function () {
    beforeEach(function () {
      return callApp(app, { method: 'PUT', path: '/posts/1' });
    });

    it('returns 404', function () {
      expect(lastResponse.status).toEqual(404);
    });
  });

  describe('GET /users/1', function () {
    beforeEach(function () {
      return callApp(app, '/users/1');
    });

    it('has the correct params', function () {
      // Regular expressions don't have named parameters.
      expect(lastParams()).toEqual({});
    });
  });
});
