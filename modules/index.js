/**
 * The current version of mach.
 */
exports.version = '0.12.0';

/**
 * The User-Agent string for mach.
 */
exports.USER_AGENT_STRING = 'mach/' + exports.version;

exports.Connection = require('./Connection');
exports.Location = require('./Location');
exports.Message = require('./Message');

// Make client methods available always.
require('./client');

// Make server methods available on the server.
if (typeof window === 'undefined')
  require('./server' + ''); // Stop Browserify.
