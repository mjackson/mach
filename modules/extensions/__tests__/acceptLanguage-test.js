var expect = require('expect');
var mach = require('../../index');

function ok(conn) {
  return 200;
}

describe('extensions/acceptLanguage', function () {

  beforeEach(function () {
    mach.extend(require('../acceptLanguage'));
  });

  describe('a message with an Accept-Language header', function () {
    var message;
    beforeEach(function () {
      message = new mach.Message(null, {
        'Accept-Language': 'jp'
      });
    });

    it('accepts acceptable languages', function () {
      expect(message.acceptsLanguage('jp')).toBe(true);
    });

    it('does not accept unacceptable languages', function () {
      expect(message.acceptsLanguage('da')).toBe(false);
    });
  });

  describe('a connection where the request has an Accept-Language header', function () {
    var conn;
    beforeEach(function () {
      return mach.get(ok, {
        headers: {
          'Accept-Language': 'jp'
        }
      }).then(function (c) {
        conn = c;
        expect(conn.request.getHeader('Accept-Language')).toEqual('jp');
      });
    });

    it('accepts acceptable languages', function () {
      expect(conn.acceptsLanguage('jp')).toBe(true);
    });

    it('does not accept unacceptable languages', function () {
      expect(conn.acceptsLanguage('da')).toBe(false);
    });
  });

});
