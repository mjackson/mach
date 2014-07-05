function decodeBase64(string) {
  return new Buffer(string, 'base64').toString();
}

module.exports = decodeBase64;
