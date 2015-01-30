var expect = require('expect');
var callApp = require('../../utils/callApp');
var router = require('../router');

var UNDEF = '__UNDEFINED__'; // So we can test for undefined.

function stringifyParams(conn) {
  return JSON.stringify(conn.params, function (key, value) {
    return value === undefined ? UNDEF : value;
  });
}

describe('middleware/router', function () {

  var app = router();

  app.route('/posts/:id', 'GET', stringifyParams);
  app.route('/posts/:id', [ 'POST', 'DELETE' ], stringifyParams);
  app.route('/feeds/:id.?:format?', stringifyParams);
  app.route('/files/*.*', stringifyParams);
  app.route(/\/users\/(\d+)/i, stringifyParams);
  app.route('POST /comments', stringifyParams);

  describe('when a match cannot be made', function () {
    it('returns 404', function () {
      return callApp(app, '/').then(function (conn) {
        expect(conn.status).toEqual(404);
      });
    });
  });

  describe('GET /posts/1', function () {
    it('has the correct params', function () {
      return callApp(app, '/posts/1').then(function (conn) {
        expect(JSON.parse(conn.responseText)).toEqual({ id: '1' });
      });
    });
  });

  describe('POST /posts/2', function () {
    it('has the correct params', function () {
      return callApp(app, { method: 'POST', url: '/posts/2' }).then(function (conn) {
        expect(JSON.parse(conn.responseText)).toEqual({ id: '2' });
      });
    });
  });

  describe('DELETE /posts/3', function () {
    it('has the correct params', function () {
      return callApp(app, { method: 'DELETE', url: '/posts/3' }).then(function (conn) {
        expect(JSON.parse(conn.responseText)).toEqual({ id: '3' });
      });
    });
  });

  describe('GET /feeds/5', function () {
    it('has the correct params', function () {
      return callApp(app, '/feeds/5').then(function (conn) {
        expect(JSON.parse(conn.responseText)).toEqual({ id: '5', format: UNDEF });
      });
    });
  });

  describe('GET /feeds/5.html', function () {
    it('has the correct params', function () {
      return callApp(app, '/feeds/5.html').then(function (conn) {
        expect(JSON.parse(conn.responseText)).toEqual({ id: '5', format: 'html' });
      });
    });
  });

  describe('GET /files/feed.xml', function () {
    it('has the correct params', function () {
      return callApp(app, '/files/feed.xml').then(function (conn) {
        expect(JSON.parse(conn.responseText)).toEqual({ splat: [ 'feed', 'xml' ] });
      });
    });
  });

  describe('GET /files/feed.', function () {
    it('has the correct params', function () {
      return callApp(app, '/files/feed.').then(function (conn) {
        expect(JSON.parse(conn.responseText)).toEqual({ splat: [ 'feed', '' ] });
      });
    });
  });

  describe('GET /files/.xml', function () {
    it('has the correct params', function () {
      return callApp(app, '/files/.xml').then(function (conn) {
        expect(JSON.parse(conn.responseText)).toEqual({ splat: [ '', 'xml' ] });
      });
    });
  });

  describe('PUT /posts/1', function () {
    it('has the correct params', function () {
      return callApp(app, { method: 'PUT', path: '/posts/1' }).then(function (conn) {
        expect(conn.status).toEqual(404);
      });
    });
  });

  describe('GET /users/1', function () {
    it('has the correct params', function () {
      return callApp(app, '/users/1').then(function (conn) {
        // Regular expressions don't have named parameters.
        expect(JSON.parse(conn.responseText)).toEqual({});
      });
    });
  });

  describe('POST /comments', function () {
    it('routes the request correctly', function () {
      return callApp(app, {
        method: 'POST',
        url: '/comments'
      }).then(function (conn) {
        expect(conn.method).toEqual('POST');
        expect(conn.status).toEqual(200);
      });
    });
  });

});
