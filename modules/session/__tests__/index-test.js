var assert = require('assert');
var expect = require('expect');
var session = require('../index');
var CookieStore = require('../CookieStore');
var MemoryStore = require('../MemoryStore');
var callApp = require('../../__tests__/callApp'); // TODO: remove

function counter(request) {
  var session = request.session;
  assert(session);

  session.count = (session.count || 0) + 1;

  return JSON.stringify(session);
}

function extractCookie(setCookie) {
  var match = setCookie.match(/_session=[^;]+/);
  assert(match);
  return match[0];
}

describe('mach.session', function () {
  describe('when using a server-side store', function () {
    var store = new MemoryStore({ expireAfter: 10 });
    var app = session(counter, {
      secret: 'secret',
      store: store
    });

    describe('when a request is made', function () {
      beforeEach(function () {
        return callApp(app, '/');
      });

      it('sets a cookie in the response', function () {
        assert(lastResponse.headers['Set-Cookie']);
      });

      it('instantiates a new session', function () {
        var data = JSON.parse(lastResponse.buffer);
        expect(data.count).toEqual(1);
      });

      describe('and then another', function () {
        beforeEach(function () {
          var setCookie = lastResponse.headers['Set-Cookie'];
          var cookie = extractCookie(setCookie);
          return callApp(app, {
            headers: { Cookie: cookie }
          });
        });

        it('does not set a cookie in the response', function () {
          assert(!lastResponse.headers['Set-Cookie']);
        });

        it('persists session data', function () {
          var data = JSON.parse(lastResponse.buffer);
          expect(data.count).toEqual(2);
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
      beforeEach(function () {
        return callApp(app, '/');
      });

      it('sets a cookie in the response', function () {
        assert(lastResponse.headers['Set-Cookie']);
      });

      it('instantiates a new session', function () {
        var data = JSON.parse(lastResponse.buffer);
        expect(data.count).toEqual(1);
      });

      describe('and then another', function () {
        beforeEach(function () {
          var setCookie = lastResponse.headers['Set-Cookie'];
          var cookie = extractCookie(setCookie);
          return callApp(app, {
            headers: { Cookie: cookie }
          });
        });

        it('sets a cookie in the response', function () {
          assert(lastResponse.headers['Set-Cookie']);
        });

        it('persists session data', function () {
          var data = JSON.parse(lastResponse.buffer);
          expect(data.count).toEqual(2);
        });
      });
    });
  });
});
