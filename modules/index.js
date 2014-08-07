var mach = module.exports;

/**
 * The current version of mach.
 */
mach.version = '0.12.0';

mach.Message = require('./Message');
mach.Request = require('./Request');
mach.Response = require('./Response');

mach.serve = function () {
  console.warn(
    'require("mach").serve is deprecated. To run mach as a web server you should require("mach/server") instead.'
  );

  var moduleID = './server'; // Stop Browserify.
  return require(moduleID).serve.apply(this, arguments);
};
