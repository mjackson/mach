var mach = require('../index');

Object.defineProperties(
  mach.Message.prototype,
  require('./MessageProperties')
);

module.exports = mach;
