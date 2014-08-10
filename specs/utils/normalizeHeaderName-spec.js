require('../helper');
var irregularHeaderNames = require('../../modules/utils/irregularHeaderNames');
var normalizeHeaderName = require('../../modules/utils/normalizeHeaderName');

describe('normalizeHeaderName', function () {

  it('correctly normalizes Content-Type', function () {
    expect(normalizeHeaderName('content-type')).toEqual('Content-Type');
  });

  Object.keys(irregularHeaderNames).forEach(function (key) {
    var headerName = irregularHeaderNames[key];

    it('correctly normalizes ' + headerName, function () {
      expect(normalizeHeaderName(key)).toEqual(headerName);
    });
  });

});
