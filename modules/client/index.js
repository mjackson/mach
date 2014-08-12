var mach = require('../proxy');

Object.defineProperties(
  mach,
  require('./utils/sugarMethods')
);

mach.call = require('./call');

module.exports = mach;
