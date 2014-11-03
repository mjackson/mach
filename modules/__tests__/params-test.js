var assert = require('assert');
var expect = require('expect');
var params = require('../params');
var callApp = require('./callApp');

function stringifyParams(request) {
  return JSON.stringify(request.params);
}

describe('mach.params', function () {
  describe('when both query and content parameters are present', function () {
    beforeEach(function () {
      return callApp(params(stringifyParams), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        queryString: 'a=b&c=d',
        content: 'a=c'
      });
    });

    it('merges query and content parameters, giving precedence to content', function () {
      assert(lastResponse.buffer);
      var params = JSON.parse(lastResponse.buffer);
      assert(params);
      expect(params.a).toEqual('c');
      expect(params.c).toEqual('d');
    });
  });

  describe('when the request content length exceeds the maximum allowed length', function () {
    beforeEach(function () {
      return callApp(params(stringifyParams, { maxLength: 100 }), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        content: 'q=' + Array(100).join('a')
      });
    });

    it('returns 413', function () {
      expect(lastResponse.status).toEqual(413);
    });
  });
});
