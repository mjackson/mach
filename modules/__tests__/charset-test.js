var expect = require('expect');
var callApp = require('../utils/callApp');
var charset = require('../charset');

function ok() {
  return 200;
}

describe('mach.charset', function () {
  it('changes the reponse\'s charset', function () {
    return callApp(charset(ok, 'iso-8859-15'), '/').then(function (conn) {
      expect(conn.response.charset).toEqual("iso-8859-15");
    });
  });
});
