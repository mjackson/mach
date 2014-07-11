assert = require('assert');
expect = require('expect');
mach = require('../modules');
var utils = mach.utils;

refute = function (condition, message) {
  assert(!condition, message);
};

// This global holds the response to the last request made via callApp.
lastResponse = null;

beforeEach(function () {
  lastResponse = null;
});

var Stream = require('bufferedstream');

// For convenience in calling apps in tests.
callApp = function (app, options, leaveBuffer) {
  options = options || {};

  // If options is a string it specifies a URL.
  if (typeof options === 'string') {
    var parsedURL = utils.parseURL(options);
    options = {
      protocol: parsedURL.protocol,
      serverName: parsedURL.hostname,
      serverPort: parsedURL.port,
      pathInfo: parsedURL.pathname,
      queryString: parsedURL.query
    };
  }

  // Params may be given as an object.
  if (options.params) {
    var encodedParams = utils.stringifyQuery(options.params);

    if (options.method === 'POST' || options.method === 'PUT') {
      if (!options.headers)
        options.headers = {};

      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      options.content = encodedParams;
    } else {
      options.queryString = encodedParams;
      options.content = '';
    }

    delete options.params;
  }

  var request = new mach.Request(options);

  return request.call(app).then(function (response) {
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
