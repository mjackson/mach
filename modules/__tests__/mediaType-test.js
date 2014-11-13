var expect = require('expect');
var callApp = require('../utils/callApp');
var mediaType = require('../mediaType');

function ok() {
  return 200;
}

describe('mach.mediaType', function () {
  it('the reponse\'s media type', function () {
    return callApp(mediaType(ok, 'text/plain'), '/').then(function (conn) {
      expect(conn.response.mediaType).toEqual('text/plain');
    });
  });
});
