var mach = module.exports;

/**
 * The current version of mach.
 */
mach.version = '0.12.0';

mach.Message = require('./Message');
mach.Request = require('./Request');
mach.Response = require('./Response');

mach.proxy = require('./utils/makeProxy');

// Always make client methods available.
require('./client');

// Automatically make server methods available if we're on Node.js.
if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]')
  [ './accept', './server' ].forEach(require);
