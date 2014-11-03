var mach = require('../index');

Object.defineProperties(
  mach.Request.prototype,
  require('./RequestProperties')
);

module.exports = mach;
