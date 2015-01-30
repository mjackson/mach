var EXTENSIONS = [];

/*!
 * mach - HTTP for JavaScript
 * https://github.com/mjackson/mach
 */
var mach = module.exports = {

  version: require('./version'),
  Connection: require('./Connection'),
  Header: require('./Header'),
  Location: require('./Location'),
  Message: require('./Message'),

  extend: function () {
    var extension;
    for (var i = 0, len = arguments.length; i < len; ++i) {
      extension = arguments[i];

      if (EXTENSIONS.indexOf(extension) === -1) {
        EXTENSIONS.push(extension);
        extension(mach);
      }
    }
  }

};

mach.extend(require('./extensions/default'));
