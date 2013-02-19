assert = require('assert');
var Stream = require('stream');
mach = require('../lib');
var utils = mach.utils;

// Override mocha's built-in methods with promise-aware versions.
require('mocha-as-promised')();

// This global holds the response to the last request made via callApp.
lastResponse = null;

// For convenience in calling apps in tests.
callApp = function (app, options, leaveBuffer) {
  var request = new mach.Request(options);
  return request.call(app).then(function (response) {
    lastResponse = response;

    // Automatically buffer response streams for convenience in tests that
    // need to test the response content.
    return utils.bufferStream(response.content).then(function (buffer) {
      if (!leaveBuffer) buffer = buffer.toString();
      lastResponse.buffer = buffer;
      return lastResponse;
    });
  });
}

fakeStream = function (target) {
  target.data = '';

  var stream = Object.create(Stream.prototype);
  stream.writable = true;
  stream.write = function (chunk, encoding) {
    if (typeof chunk === 'string') {
      target.data += chunk;
    } else if (encoding) {
      target.data += chunk.toString(encoding);
    } else {
      target.data += chunk.toString();
    }
  };

  return stream;
}
