var mach = require('../index');

Object.defineProperties(
  mach.Request.prototype,
  require('./requestMethods')
);

mach.forward = require('./forward');

mach.Proxy = require('./Proxy');

mach.send = require('./utils/sendRequest');

module.exports = mach;
