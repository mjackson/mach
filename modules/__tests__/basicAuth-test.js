var assert = require('assert');
var expect = require('expect');
var encodeBase64 = require('../utils/encodeBase64');
var basicAuth = require('../basicAuth');
var callApp = require('./callApp');

function makeBasicAuthorization(username, password) {
  return 'Basic ' + encodeBase64(username + ':' + password);
}

function ok() {
  return 200;
}

function validateCredentials(username, password) {
  return username === 'michael' && password === 'password';
}

describe('mach.basicAuth', function () {
  var app;
  beforeEach(function () {
    app = basicAuth(ok, validateCredentials);
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
