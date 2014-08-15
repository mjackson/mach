var mach = module.exports;

/**
 * The current version of mach.
 */
mach.version = '0.12.0';

mach.Message = require('./Message');
mach.Request = require('./Request');
mach.Response = require('./Response');

mach.proxy = require('./utils/makeProxy');

var isNode = require('./utils/isNode');

// Always make client methods available.
require('./client');

// Make server methods available on Node.js.
if (isNode()) {
  var moduleID = './server'; // Stop Browserify.
  require(moduleID);
}
