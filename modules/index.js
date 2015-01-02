var EXTENSIONS = [];

/*!
 * mach - HTTP for JavaScript
 * https://github.com/mjackson/mach
 */
var mach = module.exports = {

  Connection: require('./Connection'),
  Header: require('./Header'),
  Location: require('./Location'),
  Message: require('./Message'),
  version: require('./version'),

  extend: function (extension) {
    if (EXTENSIONS.indexOf(extension) === -1) {
      EXTENSIONS.push(extension);
      extension(mach);
    }
  }

};

mach.extend(require('./extensions/client'));

if (typeof window === 'undefined') {
  mach.extend(require('./extensions/accept'));
  mach.extend(require('./extensions/fs'));
  mach.extend(require('./extensions/multipart'));
  mach.extend(require('./extensions/proxy'));
  mach.extend(require('./extensions/server'));
}
