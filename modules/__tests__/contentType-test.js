var expect = require('expect');
var contentType = require('../contentType');
var callApp = require('./callApp');

function ok() {
  return 200;
}

describe('mach.contentType', function () {
  var expectedType;
  beforeEach(function () {
    expectedType = 'text/plain';
    return callApp(contentType(ok, expectedType), '/');
  });

  it('adds a Content-Type header', function () {
    expect(lastResponse.headers['Content-Type']).toEqual(expectedType);
  });
});
