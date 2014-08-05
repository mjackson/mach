var mach = require('../multipart');

Object.defineProperties(
  mach.Message.prototype,
  require('./messageMethods')
);

Object.defineProperties(
  mach.Response.prototype,
  require('./responseMethods')
);

mach.file = require('./file');

module.exports = mach;
