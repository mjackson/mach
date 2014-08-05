require('./helper');
var contentType = mach.contentType;
var utils = mach.utils;

describe('mach.contentType', function () {
  var expectedType = 'text/plain';
  var app = contentType(mach.defaultApp, expectedType);

  beforeEach(function () {
    return callApp(app, '/');
  });

  it('adds a Content-Type header', function () {
    expect(lastResponse.headers['Content-Type']).toEqual(expectedType);
  });
});
