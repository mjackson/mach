/**
 * The default extension for browser environments.
 */
module.exports = function (mach) {
  mach.extend(require('./client'));
};
