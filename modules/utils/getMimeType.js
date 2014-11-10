var MimeTypes = require('./MimeTypes');

var ExtTypes = {};

for (var type in MimeTypes) {
  MimeTypes[type].forEach(function (ext) {
    ExtTypes[ext] = type;
  });
}

var DEFAULT_TYPE = 'application/octet-stream';
var EXT_MATCHER = /\.(\w+)$/;

function getMimeType(file, defaultType) {
  var match = file.match(EXT_MATCHER);
  return (match && ExtTypes[match[1]]) || defaultType || DEFAULT_TYPE;
}

module.exports = getMimeType;
