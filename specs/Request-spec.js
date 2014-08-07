require('./helper');
var MaxLengthExceededError = require('../modules/utils/MaxLengthExceededError');
var Request = mach.Request;

describe('Request', function () {
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
          expect(params).toEqual({});
        });
      });
    }); // text/plain

    describe('when using Content-Type: application/json', function () {
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
            expect(params).toEqual(object);
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

        it('throws MaxLengthExceededError', function () {
          return request.parseContent(1).then(function () {
            assert(false, 'successfully parsed a content stream that is too large');
          }, function (error) {
            assert(error);
            expect(error).toBeA(MaxLengthExceededError);
          });
        });
      });
    }); // application/json

    describe('when using Content-Type: application/x-www-form-urlencoded', function () {
      describe('when the content is URL-encoded', function () {
        beforeEach(function () {
          request = new Request({
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            content: 'a=1&b=some+value'
          });
        });

        it('parses the content', function () {
          return request.parseContent().then(function (params) {
            expect(params).toEqual({ a: 1, b: 'some value' });
          });
        });
      });

      describe('when the content is too large', function () {
        beforeEach(function () {
          request = new Request({
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            content: 'a=b'
          });
        });

        it('throws MaxLengthExceededError', function () {
          return request.parseContent(1).then(function () {
            assert(false, 'successfully parsed a content stream that is too large');
          }, function (error) {
            assert(error);
            expect(error).toBeA(MaxLengthExceededError);
          });
        });
      });
    }); // application/x-www-form-urlencoded

  }); // parseContent
});
