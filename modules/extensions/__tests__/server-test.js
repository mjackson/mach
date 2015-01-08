/* jshint -W058 */
var expect = require('expect');
var mach = require('../../index');

describe('extensions/server', function () {

  beforeEach(function () {
    mach.extend(require('../server'));
  });

  describe('Message#setCookie', function () {

    var message;
    beforeEach(function () {
      message = new mach.Message;
    });

    describe('when no cookies have been previously set', function () {
      it('sets the "Set-Cookie" header to the appropriate string', function () {
        message.setCookie('cookieName', { value: 'cookieValue' });
        expect(message.headers['Set-Cookie']).toEqual('cookieName=cookieValue');
      });
    });

    describe('when cookies have been previously set', function () {
      beforeEach(function () {
        message.setCookie('previousOne', { value: 'previousOneValue' });
      });

      it('sets the "Set-Cookie" header to an array of headers', function () {
        message.setCookie('cookieName', { value: 'cookieValue' });

        expect(message.headers['Set-Cookie']).toEqual([
          'previousOne=previousOneValue',
          'cookieName=cookieValue',
        ]);
      });
    });

  });

});
