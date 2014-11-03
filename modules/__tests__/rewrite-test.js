var expect = require('expect');
var rewrite = require('../rewrite');
var callApp = require('./callApp');

function echoPathInfo(request) {
  return request.pathInfo;
}

describe('mach.rewrite', function () {
  var app = rewrite(echoPathInfo, '/abc', '/xyz');
  app = rewrite(app, /\/def/g, '/xyz');
  app = rewrite(app, '/abc.jpeg', '/def.jpeg');

  describe('GET /abc', function () {
    beforeEach(function () {
      return callApp(app, '/abc');
    });

    it('rewrites the pathInfo properly', function () {
      expect(lastResponse.buffer).toEqual('/xyz');
    });
  });

  describe('GET /def', function () {
    beforeEach(function () {
      return callApp(app, '/def');
    });

    it('rewrites the pathInfo properly', function () {
      expect(lastResponse.buffer).toEqual('/xyz');
    });
  });

  describe('GET /def/path/def', function () {
    beforeEach(function () {
      return callApp(app, '/def/path/def');
    });

    it('rewrites the pathInfo properly', function () {
      expect(lastResponse.buffer).toEqual('/xyz/path/xyz');
    });
  });

  describe('when the pattern contains special RegExp chars', function () {
    beforeEach(function () {
      return callApp(app, '/abcdjpeg');
    });

    it('properly escapes those chars', function () {
      expect(lastResponse.buffer).toEqual('/abcdjpeg');
    });
  });
});
