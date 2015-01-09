var expect = require('expect');
var callApp = require('../../utils/callApp');
var charset = require('../charset');

function ok() {
  return 200;
}

function jsonISO88591(conn) {
  conn.json(200, 'hi there');
  conn.response.contentType = 'application/json; charset=iso-8859-1';
}

function json(conn) {
  conn.json(200, 'hi there');  
}

describe('middleware/charset', function () {
  describe('when the response does not have a Content-Type', function () {
    it('does not set a charset', function () {
      return callApp(charset(ok, 'utf-8')).then(function (conn) {
        expect(conn.response.charset).toBe(null);
      });
    });
  });

  describe('when the response has a Content-Type with a charset', function () {
    it('does not modify the existing charset', function () {
      return callApp(charset(jsonISO88591, 'utf-8')).then(function (conn) {
        expect(conn.response.charset).toBe('iso-8859-1');
      });
    });
  });

  describe('when the response has a Content-Type with no charset', function () {
    it('adds the given charset', function () {
      return callApp(charset(json, 'utf-8')).then(function (conn) {
        expect(conn.response.charset).toEqual('utf-8');
      });
    });
  });
});
