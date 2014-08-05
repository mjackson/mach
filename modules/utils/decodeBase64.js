var Buffer = require('buffer').Buffer;

function decodeBase64(string) {
  return new Buffer(string, 'base64').toString(arguments[1]);
}

module.exports = decodeBase64;
