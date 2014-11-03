var expect = require('expect');
var forward = require('../forward');
var callApp = require('./callApp');

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
    beforeEach(function () {
      return callApp(forward(ok, target));
    });

    it('forwards the request', function () {
      expect(lastResponse.buffer).toEqual('target');
    });
  });

  describe('a request that passes the test function', function () {
    beforeEach(function () {
      return callApp(forward(ok, target, returnTrue));
    });

    it('is forwarded', function () {
      expect(lastResponse.buffer).toEqual('target');
    });
  });

  describe('a request whose URL matches the test RegExp', function () {
    beforeEach(function () {
      return callApp(forward(ok, target, /\/test-match$/), '/test-match');
    });

    it('is forwarded', function () {
      expect(lastResponse.buffer).toEqual('target');
    });
  });

  describe('a request that does not pass the test function', function () {
    beforeEach(function () {
      return callApp(forward(ok, target, returnFalse));
    });

    it('is not forwarded', function () {
      expect(lastResponse.buffer).toEqual('ok');
    });
  });
});
