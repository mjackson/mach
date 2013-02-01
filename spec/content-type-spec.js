require('./helper');
var contentType = mach.contentType;
var utils = mach.utils;

describe('mach.contentType', function () {
  var expectedType = 'text/plain';
  var app = contentType(utils.defaultApp, expectedType);

  beforeEach(function () {
    return callApp(app, '/');
  });

  it('adds a Content-Type header', function () {
    assert.equal(lastResponse.headers['Content-Type'], expectedType);
  });
});
