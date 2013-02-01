assert = require('assert');
var q = require('q');
mach = require('../lib');

// Override mocha's built-in methods with promise-aware versions.
require('mocha-as-promised')();

// This global holds the response to the last request made via callApp.
lastResponse = null;

// For convenience in calling apps in tests.
callApp = function (app, options, leaveBuffer) {
  var request = new mach.Request(options);

  return request.call(app).then(function (response) {
    lastResponse = response;

    var content = response.content;
    var buffers = [];
    var deferred = q.defer();

    content.on('data', function (chunk) {
      buffers.push(Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk));
    });

    content.on('end', function () {
      var buffer = Buffer.concat(buffers);
      if (!leaveBuffer) buffer = buffer.toString();
      lastResponse.buffer = buffer;
      deferred.resolve(lastResponse);
    });

    content.resume();

    return deferred.promise;
  });
}
