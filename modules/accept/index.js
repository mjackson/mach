var mach = require('../index');

Object.defineProperties(
  mach.Message.prototype,
  require('./MessageProperties')
);

Object.defineProperties(
  mach.Connection.prototype,
  require('./ConnectionProperties')
);

module.exports = mach;
