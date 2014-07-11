var bops = require('bops');

function encodeBase64(string) {
  return bops.to(bops.from(string, arguments[1]), 'base64');
}

module.exports = encodeBase64;
