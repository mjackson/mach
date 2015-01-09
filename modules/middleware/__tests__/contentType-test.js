var expect = require('expect');
var callApp = require('../../utils/callApp');
var contentType = require('../contentType');

function ok() {
  return 200;
}

describe('middleware/contentType', function () {
  it('adds a Content-Type header', function () {
    return callApp(contentType(ok, 'text/plain'), '/').then(function (conn) {
      expect(conn.response.headers['Content-Type']).toEqual('text/plain');
    });
  });
});
