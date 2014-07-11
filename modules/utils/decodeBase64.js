var bops = require('bops');

function decodeBase64(string) {
  return bops.to(bops.from(string, 'base64'), arguments[1]);
}

module.exports = decodeBase64;
