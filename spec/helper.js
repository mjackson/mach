assert = require('assert');
expect = require('expect');
mach = require('../modules');
var utils = mach.utils;

// Override mocha's built-in methods with promise-aware versions.
require('mocha-as-promised')();

// This global holds the response to the last request made via callApp.
lastResponse = null;

beforeEach(function () {
  lastResponse = null;
});

var queryString = require('querystring');

// For convenience in calling apps in tests.
callApp = function (app, options, leaveBuffer) {
  options = options || {};

  // If options is a string it specifies a URL.
  if (typeof options === 'string') {
    var parsedUrl = utils.parseUrl(options);
    options = {
      protocol: parsedUrl.protocol,
      serverName: parsedUrl.hostname,
      serverPort: parsedUrl.port,
      pathInfo: parsedUrl.pathname,
      queryString: parsedUrl.query
    };
  }

  // Params may be given as an object.
  if (options.params) {
    var encodedParams = queryString.stringify(options.params);

    if (options.method === 'POST' || options.method === 'PUT') {
      if (!options.headers) options.headers = {};
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

    // Automatically buffer response streams for convenience in tests that
    // need to test the response content.
    return utils.bufferStream(response.content).then(function (buffer) {
      if (!leaveBuffer) buffer = buffer.toString();
      lastResponse.buffer = buffer;
      return lastResponse;
    });
  });
};

var Stream = require('stream');

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
};

var path = require('path');
var _files = path.join(__dirname, '_files');

specFile = function () {
  var pieces = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [ _files ].concat(pieces));
};

var util = require('util');

debug = function (object) {
  console.log(util.inspect(object, { depth: null, colors: true }))
};
