var expect = require('expect');
var callApp = require('../../utils/callApp');
var paramsMiddleware = require('../params');

function stringifyParams(conn) {
  return JSON.stringify(conn.params);
}

describe('middleware/params', function () {
  describe('when both query and content parameters are present', function () {
    it('merges query and content parameters, giving precedence to content', function () {
      return callApp(paramsMiddleware(stringifyParams), {
        method: 'POST',
        url: '/?a=b&c=d',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        content: 'a=c'
      }).then(function (conn) {
        var params = JSON.parse(conn.responseText);
        expect(params.a).toEqual('c');
        expect(params.c).toEqual('d');
      });
    });
  });

  describe('when the request content length exceeds the maximum allowed length', function () {
    it('returns 413', function () {
      return callApp(paramsMiddleware(stringifyParams, { maxLength: 100 }), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        content: 'q=' + Array(100).join('a')
      }).then(function (conn) {
        expect(conn.status).toEqual(413);
      });
    });
  });
});
