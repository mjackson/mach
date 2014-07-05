var mime = require('mime');

function mimeType(file) {
  return mime.lookup(file);
}

module.exports = mimeType;
