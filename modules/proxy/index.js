var mach = require('../index');

Object.defineProperties(
  mach.Request.prototype,
  require('./requestMethods')
);

mach.forward = require('./forward');
mach.proxy = require('./proxy');

module.exports = mach;
