module.exports = function (mach) {
  mach.extend(require('./accept'));
  mach.extend(require('./client'));
  mach.extend(require('./fs'));
  mach.extend(require('./multipart'));
  mach.extend(require('./proxy'));
  mach.extend(require('./server'));
};
