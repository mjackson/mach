var mach = require('../index');

Object.defineProperties(
  mach.Request.prototype,
  require('./utils/requestMethods')
);

mach.forward = require('./forward');
mach.proxy = require('./proxy');

module.exports = mach;
