var assert = require('assert');
var expect = require('expect');
var callApp = require('../../utils/callApp');
var stack = require('../stack');

function addHeader(app, headerName) {
  return function (conn) {
    return conn.call(app).then(function () {
      conn.response.headers[headerName] = '1';
    });
  };
}

describe('middleware/stack', function () {

  var app = stack();

  app.use(addHeader, 'One');
  app.use(addHeader, 'Two');

  app.map('/images', function () {
    return 'an image';
  });

  app.get('/home', function () {
    return 'welcome home!';
  });

  app.get('/:username', function (conn) {
    return 'welcome ' + conn.params.username;
  });

  app.use(addHeader, 'Three');

  describe('a request that does not match any mappings or routes', function () {
    it('calls all middleware', function () {
      return callApp(app, '/').then(function (conn) {
        assert(conn.response.headers['One']);
        assert(conn.response.headers['Two']);
        assert(conn.response.headers['Three']);
      });
    });
  });

  describe('a request that matches a location in front of some middleware', function () {
    it('calls the correct app', function () {
      return callApp(app, '/images').then(function (conn) {
        expect(conn.responseText).toEqual('an image');
      });
    });

    it('calls all middleware in front of that location', function () {
      return callApp(app, '/images').then(function (conn) {
        assert(conn.response.headers['One']);
        assert(conn.response.headers['Two']);
      });
    });

    it('does not call any middleware after that location', function () {
      return callApp(app, '/images').then(function (conn) {
        assert(conn.response.headers['Three'] == null);
      });
    });
  });

  describe('a request that matches a route in front of some middleware', function () {
    it('calls the correct app', function () {
      return callApp(app, '/home').then(function (conn) {
        expect(conn.responseText).toEqual('welcome home!');
      });
    });

    it('calls all middlware in front of that route', function () {
      return callApp(app, '/home').then(function (conn) {
        assert(conn.response.headers['One']);
        assert(conn.response.headers['Two']);
      });
    });

    it('does not call middleware after that route', function () {
      return callApp(app, '/home').then(function (conn) {
        assert(conn.response.headers['Three'] == null);
      });
    });
  });

});
