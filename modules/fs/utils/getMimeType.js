var mime = require('mime');

function getMimeType(file) {
  return mime.lookup(file);
}

module.exports = getMimeType;
