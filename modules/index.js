var mach = module.exports;

/**
 * The current version of mach.
 */
mach.version = require('../package').version;

mach.Message = require('./Message');
mach.Request = require('./Request');
mach.Response = require('./Response');

mach.serve = function () {
  console.warn(
    'require("mach").serve is deprecated. To run mach as a web server you should require("mach/server") instead.'
  );

  return require('./server').serve.apply(this, arguments);
};
