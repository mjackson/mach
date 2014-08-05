assert = require('assert');
expect = require('expect');
mach = require('../modules');

refute = function (condition, message) {
  assert(!condition, message);
};

var _callApp = require('../modules/utils/callApp');

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

  return _callApp(app, options).then(function (response) {
    lastResponse = response;

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

var fs = require('fs');

readFile = function (filename, encoding) {
  return fs.readFileSync(filename, encoding);
};
