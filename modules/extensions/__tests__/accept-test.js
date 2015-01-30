var expect = require('expect');
var mach = require('../../index');

function ok(conn) {
  return 200;
}

describe('extensions/accept', function () {

  beforeEach(function () {
    mach.extend(require('../accept'));
  });

  describe('a message with an Accept header', function () {
    var message;
    beforeEach(function () {
      message = new mach.Message(null, {
        'Accept': 'application/json'
      });
    });

    it('accepts acceptable media types', function () {
      expect(message.accepts('application/json')).toBe(true);
    });

    it('does not accept unacceptable media types', function () {
      expect(message.accepts('text/html')).toBe(false);
    });
  });

  describe('a connection where the request has an Accept header', function () {
    var conn;
    beforeEach(function () {
      return mach.get(ok, {
        headers: {
          'Accept': 'application/json'
        }
      }).then(function (c) {
        conn = c;
        expect(conn.request.getHeader('Accept')).toEqual('application/json');
      });
    });

    it('accepts acceptable media types', function () {
      expect(conn.accepts('application/json')).toBe(true);
    });

    it('does not accept unacceptable media types', function () {
      expect(conn.accepts('text/html')).toBe(false);
    });
  });

});
