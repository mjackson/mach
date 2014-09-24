var mach = require('../index');

Object.defineProperties(
  mach.Message.prototype,
  require('./MessageProperties')
);

mach.MultipartParser = require('./Parser');
mach.MultipartPart = require('./Part');

module.exports = mach;
