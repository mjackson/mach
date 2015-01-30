var expect = require('expect');
var mach = require('../../index');

function ok(conn) {
  return 200;
}

describe('extensions/acceptEncoding', function () {

  beforeEach(function () {
    mach.extend(require('../acceptEncoding'));
  });

  describe('a message with an Accept-Encoding header', function () {
    var message;
    beforeEach(function () {
      message = new mach.Message(null, {
        'Accept-Encoding': 'gzip'
      });
    });

    it('accepts acceptable encodings', function () {
      expect(message.acceptsEncoding('gzip')).toBe(true);
    });

    it('does not accept unacceptable encodings', function () {
      expect(message.acceptsEncoding('compress')).toBe(false);
    });
  });

  describe('a connection where the request has an Accept-Encoding header', function () {
    var conn;
    beforeEach(function () {
      return mach.get(ok, {
        headers: {
          'Accept-Encoding': 'gzip'
        }
      }).then(function (c) {
        conn = c;
        expect(conn.request.getHeader('Accept-Encoding')).toEqual('gzip');
      });
    });

    it('accepts acceptable encodings', function () {
      expect(conn.acceptsEncoding('gzip')).toBe(true);
    });

    it('does not accept unacceptable encodings', function () {
      expect(conn.acceptsEncoding('compress')).toBe(false);
    });
  });

});
