var mach = module.exports;

/**
 * The current version of mach.
 */
mach.version = '0.12.0';

mach.Message = require('./Message');
mach.Request = require('./Request');
mach.Response = require('./Response');

mach.proxy = require('./utils/createProxy');

// Always make client methods available.
require('./client');

// Make server methods available on the server.
if (typeof window === 'undefined')
  require('./server' + ''); // Stop Browserify.
