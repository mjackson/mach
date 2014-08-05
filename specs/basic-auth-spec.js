require('./helper');

describe('mach.basicAuth', function () {
  function ok(request) {
    return 200;
  }

  function validateCredentials(username, password) {
    return username === 'michael' && password === 'password';
  }

  var app;
  beforeEach(function () {
    app = mach.basicAuth(ok, validateCredentials);
  });

  describe('when no authentication credentials are given', function () {
    beforeEach(function () {
      return callApp(app);
    });

    it('returns 401 Unauthorized', function () {
      assert(lastResponse);
      expect(lastResponse.status).toEqual(401);
    });
  });

  describe('when invalid authentication credentials are given', function () {
    beforeEach(function () {
      return callApp(app, {
        headers: {
          'Authorization': makeBasicAuthorization('michael', 'wrongPassword')
        }
      });
    });

    it('returns 401 Unauthorized', function () {
      assert(lastResponse);
      expect(lastResponse.status).toEqual(401);
    });
  });

  describe('when valid credentials are given', function () {
    beforeEach(function () {
      return callApp(app, {
        headers: {
          'Authorization': makeBasicAuthorization('michael', 'password')
        }
      });
    });

    it('returns passes the app downstream', function () {
      assert(lastResponse);
      expect(lastResponse.status).toEqual(200);
    });
  });
});

function makeBasicAuthorization(username, password) {
  return 'Basic ' + mach.utils.encodeBase64([ username, password ].join(':'));
}
