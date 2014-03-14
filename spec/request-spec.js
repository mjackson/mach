require('./helper');
var fs = require('fs');
var qs = require('querystring');
var errors = mach.errors;
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
          expect(params).toEqual({});
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

        it('throws errors.MaxLengthExceededError', function () {
          return request.parseContent(1).then(function () {
            assert(false, 'successfully parsed a content stream that is too large');
          }, function (error) {
            assert(error);
            expect(error).toBeA(errors.MaxLengthExceededError);
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
            expect(params).toEqual(object);
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

        it('throws errors.MaxLengthExceededError', function () {
          return request.parseContent(1).then(function () {
            assert(false, 'successfully parsed a content stream that is too large');
          }, function (error) {
            assert(error);
            expect(error).toBeA(errors.MaxLengthExceededError);
          });
        });
      });
    }); // application/x-www-form-urlencoded

    describe('when using the multipart/form-data Content-Type', function () {
      describe('when the content is encoded properly', function () {
        var content;
        beforeEach(function () {
          content = fs.readFileSync(specFile('content_type_no_filename'));
          request = new Request({
            headers: { 'Content-Type': 'multipart/form-data; boundary=AaB03x' },
            content: content
          });
        });

        it('parses the content', function () {
          return request.parseContent().then(function (params) {
            assert(params);
            assert(params.text);
          });
        });

        it('returns strings for non-file values', function () {
          return request.parseContent().then(function (params) {
            expect(typeof params.text).toEqual('string');
          });
        });
      });
    }); // multipart/form-data

  }); // parseContent
});
