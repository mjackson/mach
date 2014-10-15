require('./helper');

describe('mach.rewrite', function () {
  var app = function (request) {
    return request.pathInfo;
  };

  app = mach.rewrite(app, '/abc', '/xyz');
  app = mach.rewrite(app, /\/def/g, '/xyz');
  app = mach.rewrite(app, '/abc.jpeg', '/def.jpeg');

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
