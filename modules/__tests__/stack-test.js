var assert = require('assert');
var expect = require('expect');
var stack = require('../stack');
var callApp = require('./callApp');

function addHeader(app, headerName) {
  return function (request) {
    return request.call(app).then(function (response) {
      response.headers[headerName] = '1';
      return response;
    });
  };
}

describe('mach.stack', function () {
  var app = stack();

  app.use(addHeader, 'One');
  app.use(addHeader, 'Two');

  app.map('/images', function (app) {
    app.run(function (request) {
      return 'an image';
    });
  });

  app.get('/home', function (request) {
    return 'welcome home!';
  });

  app.get('/:username', function (request) {
    return 'welcome ' + request.params.username;
  });

  app.use(addHeader, 'Three');

  describe('a request that does not match any mappings or routes', function () {
    beforeEach(function () {
      return callApp(app, '/');
    });

    it('calls all middleware', function () {
      assert(lastResponse.headers['One']);
      assert(lastResponse.headers['Two']);
      assert(lastResponse.headers['Three']);
    });
  });

  describe('a request that matches a location in front of some middleware', function () {
    beforeEach(function () {
      return callApp(app, '/images');
    });

    it('calls all middleware in front of that location', function () {
      assert(lastResponse.headers['One']);
      assert(lastResponse.headers['Two']);
    });

    it('does not call any middleware after that location', function () {
      assert(lastResponse.headers['Three'] == null);
    });
  });

  describe('a request that matches a route in front of some middleware', function () {
    beforeEach(function () {
      return callApp(app, '/home');
    });

    it('calls the correct app', function () {
      expect(lastResponse.buffer).toEqual('welcome home!');
    });

    it('calls all middlware in front of that route', function () {
      assert(lastResponse.headers['One']);
      assert(lastResponse.headers['Two']);
    });

    it('does not call middleware after that route', function () {
      assert(lastResponse.headers['Three'] == null);
    });
  });
});
