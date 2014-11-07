var expect = require('expect');
var callApp = require('../utils/callApp');
var forward = require('../forward');

function ok() {
  return 'ok';
}

function target() {
  return 'target';
}

function returnTrue() {
  return true;
}

function returnFalse() {
  return false;
}

describe('mach.forward', function () {
  describe('when no test function is given', function () {
    it('forwards the request', function () {
      return callApp(forward(ok, target)).then(function (conn) {
        expect(conn.responseText).toEqual('target');
      });
    });
  });

  describe('a request that passes the test function', function () {
    it('is forwarded', function () {
      return callApp(forward(ok, target, returnTrue)).then(function (conn) {
        expect(conn.responseText).toEqual('target');
      });
    });
  });

  describe('a request whose URL matches the test RegExp', function () {
    beforeEach(function () {
      return callApp(forward(ok, target, /\/test-match$/), '/test-match');
    });

    it('is forwarded', function () {
      return callApp(forward(ok, target, /\/test-match$/), '/test-match').then(function (conn) {
        expect(conn.responseText).toEqual('target');
      });
    });
  });

  describe('a request that does not pass the test function', function () {
    it('is not forwarded', function () {
      return callApp(forward(ok, target, returnFalse), '/test-match').then(function (conn) {
        expect(conn.responseText).toEqual('ok');
      });
    });
  });
});
