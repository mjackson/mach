require('./helper');
var requestParams = mach.requestParams;

describe('mach.requestParams', function () {
  describe('when both query and content parameters are present', function () {
    var app = requestParams(stringifyParams);
    beforeEach(function () {
      return callApp(app, {
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
      assert.equal(params.a, 'c');
      assert.equal(params.c, 'd');
    });
  });

  describe('when the request content length exceeds the maximum allowed length', function () {
    var app = requestParams(stringifyParams, {
      maxLength: 100
    });

    beforeEach(function () {
      return callApp(app, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        content: 'q=' + Array(100).join('a')
      });
    });

    it('returns 413', function () {
      assert.equal(lastResponse.status, 413);
    });
  });
});

function stringifyParams(request) {
  return JSON.stringify(request.params);
}
