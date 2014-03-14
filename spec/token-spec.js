require('./helper');

describe('mach.token', function () {
  var app = mach.stack();
  app.use(mach.session, { secret: 'foo' });
  app.use(mach.params);
  app.use(mach.token);
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
});

function extractCookie(setCookie) {
  var match = setCookie.match(/_session=[^;]+/);
  assert(match);
  return match[0];
}
