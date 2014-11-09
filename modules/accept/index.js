var mach = require('../index');

Object.defineProperties(
  mach.Connection.prototype,
  require('./ConnectionProperties')
);

Object.defineProperties(
  mach.Message.prototype,
  require('./MessageProperties')
);

module.exports = mach;
