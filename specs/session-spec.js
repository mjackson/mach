require('./helper');

describe('mach.session', function () {
  describe('when using a server-side store', function () {
    var store = new mach.session.MemoryStore({ expireAfter: 10 });
    var app = mach.session(counter, {
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
    var store = new mach.session.CookieStore({ secret: 'secret' });
    var app = mach.session(counter, {
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

function counter(request) {
  var session = request.session;
  assert(session);

  if (!session.count) session.count = 0;
  session.count += 1;

  return JSON.stringify(session);
}

function extractCookie(setCookie) {
  var match = setCookie.match(/_session=[^;]+/);
  assert(match);
  return match[0];
}
