require('./helper');

function ok() {
  return 200;
}

describe('mach.contentType', function () {
  var expectedType;
  beforeEach(function () {
    expectedType = 'text/plain';
    return callApp(mach.contentType(ok, expectedType), '/');
  });

  it('adds a Content-Type header', function () {
    expect(lastResponse.headers['Content-Type']).toEqual(expectedType);
  });
});
