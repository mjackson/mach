require('./helper');
var qs = require('querystring');
var Request = mach.Request;

describe('A mach.Request', function () {
  var request;
  beforeEach(function () {
    request = new Request;
  });

  describe('parseContent', function () {
    describe('when using a Content-Type that we cannot parse', function () {
      beforeEach(function () {
        request.headers['content-type'] = 'text/plain';
      });

      it('returns an empty object', function () {
        return request.parseContent().then(function (params) {
          assert.deepEqual(params, {});
        });
      });
    }); // text/plain

    describe('when using the application/json Content-Type', function () {
      describe('when the content is valid JSON', function () {
        var object;
        beforeEach(function () {
          object = { a: 1, b: 'some value' };
          request = new Request({
            headers: { 'Content-Type': 'application/json' },
            content: JSON.stringify(object)
          });
        });

        it('parses the content', function () {
          return request.parseContent().then(function (params) {
            assert.deepEqual(params, object);
          });
        });
      });

      describe('when the content is not valid JSON', function () {
        beforeEach(function () {
          request = new Request({
            headers: { 'Content-Type': 'application/json' },
            content: 'hello world'
          });
        });

        it('throws an error', function () {
          return request.parseContent().then(function () {
            assert(false, 'successfully parsed invalid JSON');
          }, function (error) {
            assert(error);
          });
        });
      });

      describe('when the content is too large', function () {
        beforeEach(function () {
          request = new Request({
            headers: { 'Content-Type': 'application/json' },
            content: '{}'
          });
          request.maxContentLength = 1;
        });

        it('throws a 413', function () {
          return request.parseContent().then(function () {
            assert(false, 'successfully parsed a content stream that is too large');
          }, function (error) {
            assert(error);
            assert.equal(error.status, 413);
          });
        });
      });
    }); // application/json

    describe('when using the application/x-www-form-urlencoded Content-Type', function () {
      describe('when the content is URL-encoded', function () {
        var object;
        beforeEach(function () {
          object = { a: 1, b: 'some value' };
          request = new Request({
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            content: qs.stringify(object)
          });
        });

        it('parses the content', function () {
          return request.parseContent().then(function (params) {
            assert.deepEqual(params, object);
          });
        });
      });

      describe('when the content is too large', function () {
        beforeEach(function () {
          request = new Request({
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            content: 'a=b'
          });
          request.maxContentLength = 1;
        });

        it('throws a 413', function () {
          return request.parseContent().then(function () {
            assert(false, 'successfully parsed a content stream that is too large');
          }, function (error) {
            assert(error);
            assert.equal(error.status, 413);
          });
        });
      });
    }); // application/x-www-form-urlencoded

  }); // parseContent
});
