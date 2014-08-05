require('../helper');

describe('A request to hello world', function () {
  var content = 'Hello world!';
  function app(request) {
    return content;
  }

  beforeEach(function () {
    return callApp(app);
  });

  it('returns 200', function () {
    assert(lastResponse);
    expect(lastResponse.status).toEqual(200);
  });

  it('returns "hello world"', function () {
    assert(lastResponse);
    expect(lastResponse.buffer).toEqual(content);
  });
});
