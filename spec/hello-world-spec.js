require('./helper');

describe('A request to hello world', function () {
  beforeEach(function () {
    return callApp(function (request) {
      return 'hello world';
    });
  });

  it('returns 200', function () {
    assert(lastResponse);
    assert.equal(lastResponse.status, 200);
  });

  it('returns "hello world"', function () {
    assert(lastResponse);
    assert.equal(lastResponse.buffer, 'hello world');
  });
});
