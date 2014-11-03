var assert = require('assert');
var expect = require('expect');
var params = require('../params');
var session = require('../session');
var stack = require('../stack');
var token = require('../token');
var callApp = require('./callApp');

function extractCookie(setCookie) {
  var match = setCookie.match(/_session=[^;]+/);
  assert(match);
  return match[0];
}

describe('mach.token', function () {
  var app = stack();
  app.use(session, { secret: 'foo' });
  app.use(params);
  app.use(token);
  app.run(function (request) {
    return request.session._token;
  });

  describe('when the request parameters are missing the session token', function () {
    beforeEach(function () {
      return callApp(app, {
        method: 'POST'
      });
    });

    it('returns 403', function () {
      expect(lastResponse.status).toEqual(403);
    });
  });

  describe('when the request parameters contain the session token', function () {
    beforeEach(function () {
      // Call it twice. First time is to get the token and cookie.
      return callApp(app).then(function (response) {
        var token = response.buffer;
        var cookie = extractCookie(response.headers['Set-Cookie']);
        return callApp(app, {
          method: 'POST',
          headers: { Cookie: cookie },
          params: { _token: token }
        });
      });
    });

    it('passes the request downstream', function () {
      expect(lastResponse.status).toEqual(200);
    });
  });

  describe('when the request is not a POST', function () {
    beforeEach(function () {
      return callApp(app, {
        method: 'GET'
      });
    });

    it('passes the request downstream', function () {
      expect(lastResponse.status).toEqual(200);
    });
  });
});
