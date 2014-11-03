var expect = require('expect');
var gzip = require('../gzip');
var callApp = require('./callApp');
var getFixture = require('./getFixture');

describe('mach.gzip', function () {
  var contents = getFixture('test.txt');
  var gzippedContents = getFixture('test.txt.gz');
  var app = gzip(function (request) {
    return {
      headers: { 'Content-Type': 'text/plain' },
      content: contents
    };
  });

  describe('when the client accepts gzip encoding', function () {
    beforeEach(function () {
      return callApp(app, {
        headers: { 'Accept-Encoding': 'gzip' },
        leaveBuffer: true
      });
    });

    it('sets the Content-Encoding header to "gzip"', function () {
      expect(lastResponse.headers['Content-Encoding']).toEqual('gzip');
    });

    it('sets the Vary header to "Accept-Encoding"', function () {
      expect(lastResponse.headers['Vary']).toEqual('Accept-Encoding');
    });

    it('gzip-encodes the response content', function () {
      expect(lastResponse.buffer).toEqual(gzippedContents);
    });
  });

  describe('when the client does not accept gzip encoding', function () {
    beforeEach(function () {
      return callApp(app, {
        leaveBuffer: true
      });
    });

    it('does not encode the content', function () {
      expect(lastResponse.buffer).toEqual(contents);
    });
  });

  describe('when the response is a text/event-stream', function () {
    var app = gzip(function (request) {
      return {
        headers: { 'Content-Type': 'text/event-stream' },
        content: contents
      };
    });

    beforeEach(function () {
      return callApp(app, { leaveBuffer: true });
    });

    it('does not encode the content', function () {
      expect(lastResponse.buffer).toEqual(contents);
    });
  });
});
