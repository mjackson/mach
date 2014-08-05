assert = require('assert');
expect = require('expect');
mach = require('../modules');

refute = function (condition, message) {
  assert(!condition, message);
};

// This global holds the response to the last request made via callApp.
lastResponse = null;

beforeEach(function () {
  lastResponse = null;
});

var utils = mach.utils;

// For convenience in calling apps in tests.
callApp = function (app, options) {
  options = options || {};

  var leaveBuffer = !!options.leaveBuffer;

  return utils.callApp(app, options).then(function (response) {
    lastResponse = response;

    // Automatically buffer response streams for convenience
    // in tests that need to test the response content.
    return response.bufferContent().then(function (buffer) {
      if (!leaveBuffer)
        buffer = buffer.toString();

      lastResponse.buffer = buffer;

      return lastResponse;
    });
  });
};

var path = require('path');
var _files = path.join(__dirname, '_files');

specFile = function () {
  var pieces = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [ _files ].concat(pieces));
};
