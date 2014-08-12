require('./helper');
var MaxLengthExceededError = require('../modules/utils/MaxLengthExceededError');
var Request = mach.Request;

describe('Request', function () {
  describe('that uses https', function () {
    describe('on the standard port', function () {
      it('does not include the port # in host', function () {
        var request = new Request({ protocol: 'https:', serverName: 'example.com' });
        expect(request.host).toEqual('example.com');
      });
    });

    describe('on a non-standard port', function () {
      it('includes the port # in host', function () {
        var request = new Request({ protocol: 'https:', serverName: 'example.com', serverPort: 5000 });
        expect(request.host).toEqual('example.com:5000');
      });
    });
  });

  describe('parseContent', function () {
    var request;
    beforeEach(function () {
      request = new Request;
    });

    describe('when using an unknown Content-Type', function () {
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
