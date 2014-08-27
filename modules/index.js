/**
 * The current version of mach.
 */
exports.version = '0.12.0';

exports.Message = require('./Message');
exports.Request = require('./Request');
exports.Response = require('./Response');

exports.call = require('./utils/callApp');
exports.proxy = require('./utils/createProxy');

var mergeProperties = require('./utils/mergeProperties');

[ 'DELETE',
  'GET',
  'HEAD',
  'OPTIONS',
  'PATCH',
  'POST',
  'PUT'
].forEach(function (method) {
  exports[method.toLowerCase()] = function (app, options) {
    return exports.call(app, mergeProperties(options || {}, { method: method }));
  };
});

// Make server methods available on the server.
if (typeof window === 'undefined')
  require('./server' + ''); // Stop Browserify.
