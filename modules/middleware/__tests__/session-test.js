var assert = require('assert');
var expect = require('expect');
var callApp = require('../../utils/callApp');
var CookieStore = require('../session/CookieStore');
var MemoryStore = require('../session/MemoryStore');
var session = require('../session');

function counter(request) {
  var session = request.session;
  assert(session);

  session.count = (session.count || 0) + 1;

  return JSON.stringify(session);
}

function getSessionCookie(setCookieHeader) {
  var match = setCookieHeader.match(/_session=[^;]+/);
  assert(match);
  return match[0];
}

describe('middleware/session', function () {

  describe('when using a server-side store', function () {
    var store = new MemoryStore({ expireAfter: 10 });
    var app = session(counter, {
      secret: 'secret',
      store: store
    });

    describe('when a request is made', function () {
      it('sets a cookie in the response', function () {
        return callApp(app).then(function (conn) {
          assert(conn.response.headers['Set-Cookie']);
        });
      });

      it('instantiates a new session', function () {
        return callApp(app).then(function (conn) {
          expect(JSON.parse(conn.responseText).count).toEqual(1);
        });
      });

      describe('and then another', function () {
        it('does not set a cookie in the response', function () {
          return callApp(app).then(function (conn) {
            var cookie = getSessionCookie(conn.response.headers['Set-Cookie']);

            return callApp(app, {
              headers: { Cookie: cookie }
            }).then(function (conn) {
              assert(!conn.response.headers['Set-Cookie']);
            });
          });
        });

        it('persists session data', function () {
          return callApp(app).then(function (conn) {
            var cookie = getSessionCookie(conn.response.headers['Set-Cookie']);

            return callApp(app, {
              headers: { Cookie: cookie }
            }).then(function (conn) {
              expect(JSON.parse(conn.responseText).count).toEqual(2);
            });
          });
        });
      });
    });
  });

  describe('when using a client-side store', function () {
    var store = new CookieStore({ secret: 'secret' });
    var app = session(counter, {
      secret: 'secret',
      store: store
    });

    describe('when a request is made', function () {
      it('sets a cookie in the response', function () {
        return callApp(app).then(function (conn) {
          assert(conn.response.headers['Set-Cookie']);
        });
      });

      it('instantiates a new session', function () {
        return callApp(app).then(function (conn) {
          expect(JSON.parse(conn.responseText).count).toEqual(1);
        });
      });

      describe('and then another', function () {

        it('sets a cookie in the response', function () {
          return callApp(app).then(function (conn) {
            var cookie = getSessionCookie(conn.response.headers['Set-Cookie']);

            return callApp(app, {
              headers: { Cookie: cookie }
            }).then(function (conn) {
              assert(conn.response.headers['Set-Cookie']);
            });
          });
        });

        it('persists session data', function () {
          return callApp(app).then(function (conn) {
            var cookie = getSessionCookie(conn.response.headers['Set-Cookie']);

            return callApp(app, {
              headers: { Cookie: cookie }
            }).then(function (conn) {
              expect(JSON.parse(conn.responseText).count).toEqual(2);
            });
          });
        });

      });
    });
  });

});
