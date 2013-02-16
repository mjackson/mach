require('./helper');
var sessionCookie = mach.sessionCookie;

describe('mach.sessionCookie', function () {
  describe('when the cookie is ok', function () {
    var app = sessionCookie(increment);
    beforeEach(function () {
      return callApp(app, '/');
    });

    it('properly serializes/deserializes cookie data', function () {
      assert.ok(lastResponse.headers['Set-Cookie']);
      assert.equal(JSON.parse(lastResponse.buffer).counter, 1);
      var match = lastResponse.headers['Set-Cookie'].match(/_session=[^;]+/);
      assert.ok(match);
      return callApp(app, { headers: { Cookie: match[0] } }).then(function () {
        assert.ok(lastResponse.headers['Set-Cookie']);
        assert.equal(JSON.parse(lastResponse.buffer).counter, 2);
      });
    });
  });

  describe('when the cookie has been tampered with', function () {
    var app = sessionCookie(increment);
    beforeEach(function () {
      return callApp(app, '/');
    });

    it('erases the cookie data', function () {
      assert.ok(lastResponse.headers['Set-Cookie']);
      assert.equal(JSON.parse(lastResponse.buffer).counter, 1);
      var match = lastResponse.headers['Set-Cookie'].match(/_session=[^;]+/);
      assert.ok(match);

      // Tamper with the cookie.
      var badCookie = match[0].substring(0, match[0].length - 10);

      return callApp(app, { headers: { Cookie: badCookie } }).then(function () {
        assert.ok(lastResponse.headers['Set-Cookie']);
        assert.equal(JSON.parse(lastResponse.buffer).counter, 1);
      });
    });
  });

  describe('when the cookie size exceeds 4k', function () {
    var app = sessionCookie(toobig);
    var error;
    beforeEach(function () {
      error = {};
      return callApp(app, { error: fakeStream(error) });
    });

    it('does not set the cookie', function () {
      assert.ok(!lastResponse.headers['Set-Cookie']);
    });

    it('writes an error message to the error stream', function () {
      assert.ok(error.data.match(/content dropped/i));
    });
  });

  describe('when the cookie contains a -- it properly deserializes', function () {
    var app = sessionCookie(includeDelimiter);
    beforeEach(function () {
      return callApp(app, '/');
    });

    it('properly serializes/deserializes cookie data', function () {
      assert.ok(lastResponse.headers['Set-Cookie']);
      assert.equal(JSON.parse(lastResponse.buffer).counter, 1);
      var match = lastResponse.headers['Set-Cookie'].match(/_session=[^;]+/);
      assert.ok(match);
      return callApp(app, { headers: { Cookie: match[0] } }).then(function () {
        assert.ok(lastResponse.headers['Set-Cookie']);
        assert.equal(JSON.parse(lastResponse.buffer).counter, 2);
      });
    });
  });
});

function increment(request) {
  var session = request.session;
  assert.ok(session);

  if (!('counter' in session)) session.counter = 0;
  session.counter += 1;

  return JSON.stringify(session);
}

function toobig(request) {
  var session = request.session;
  assert.ok(session);

  var value = '';
  for (var i = 0; i < 4096; ++i) {
    value += 'a';
  }

  session.value = value;

  return JSON.stringify(session);
}

function includeDelimiter(request) {
  var session = request.session;
  assert.ok(session);

  if (!('counter' in session)) session.counter = 0;
  session.counter += 1;
  session.quote = 'The double hyphen "--" is often used in the *real* world.';

  return JSON.stringify(session);
}
