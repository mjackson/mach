var expect = require('expect');
var callApp = require('../../utils/callApp');
var rewrite = require('../rewrite');

function echoPathname(conn) {
  return conn.pathname;
}

describe('middleware/rewrite', function () {
  var app = rewrite(echoPathname, '/abc', '/xyz');
  app = rewrite(app, /\/def/g, '/xyz');
  app = rewrite(app, '/abc.jpeg', '/def.jpeg');

  describe('GET /abc', function () {
    it('rewrites the pathname properly', function () {
      return callApp(app, '/abc').then(function (conn) {
        expect(conn.responseText).toEqual('/xyz');
      });
    });
  });

  describe('GET /def', function () {
    it('rewrites the pathname properly', function () {
      return callApp(app, '/def').then(function (conn) {
        expect(conn.responseText).toEqual('/xyz');
      });
    });
  });

  describe('GET /def/path/def', function () {
    it('rewrites the pathname properly', function () {
      return callApp(app, '/def/path/def').then(function (conn) {
        expect(conn.responseText).toEqual('/xyz/path/xyz');
      });
    });
  });

  describe('when the pattern contains special RegExp chars', function () {
    it('rewrites the pathname properly', function () {
      return callApp(app, '/abcdjpeg').then(function (conn) {
        expect(conn.responseText).toEqual('/abcdjpeg');
      });
    });
  });
});
