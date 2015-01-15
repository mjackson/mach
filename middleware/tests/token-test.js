var assert = require('assert');
var expect = require('expect');
var callApp = require('../../utils/callApp');
var params = require('../params');
var session = require('../session');
var stack = require('../stack');
var token = require('../token');

function extractCookie(setCookie) {
  var match = setCookie.match(/_session=[^;]+/);
  assert(match);
  return match[0];
}

describe('middleware/token', function () {

  var app = stack();
  app.use(session, { secret: 'foo' });
  app.use(params);
  app.use(token);
  app.run(function (conn) {
    return conn.session._token;
  });

  describe('when the request parameters are missing the session token', function () {
    it('returns 403', function () {
      return callApp(app, {
        method: 'POST'
      }).then(function (conn) {
        expect(conn.status).toEqual(403);
      });
    });
  });

  describe('when the request parameters contain the session token', function () {
    it('passes the request downstream', function () {
      // Call it twice. First time is to get the token and cookie.
      return callApp(app).then(function (conn) {
        var cookie = extractCookie(conn.response.headers['Set-Cookie']);
        var token = conn.responseText;

        return callApp(app, {
          method: 'POST',
          headers: { Cookie: cookie },
          params: { _token: token }
        }).then(function (conn) {
          expect(conn.status).toEqual(200);
        });
      });
    });
  });

  describe('when the request is not a POST', function () {
    it('passes the request downstream', function () {
      return callApp(app).then(function (conn) {
        expect(conn.status).toEqual(200);
      });
    });
  });

});
