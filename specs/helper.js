assert = require('assert');
expect = require('expect');

refute = function (condition, message) {
  assert(!condition, message);
};

mach = require('../modules');

lastResponse = null;

beforeEach(function () {
  lastResponse = null;
});

/**
 * Calls the app with the given options and buffers the response
 * content for convenience in tests that need to test the content
 * of the response. Also, sets the global lastResponse variable
 * to the value of the response.
 */
callApp = function (app, options) {
  options = options || {};

  var leaveBuffer = !!options.leaveBuffer;

  return mach.call(app, options).then(function (response) {
    lastResponse = response;

    return response.bufferContent().then(function (buffer) {
      if (!leaveBuffer)
        buffer = buffer.toString();

      lastResponse.buffer = buffer;

      return lastResponse;
    });
  });
};
