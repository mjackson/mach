function encodeBase64(string) {
  return new Buffer(string, arguments[1]).toString('base64');
}

module.exports = encodeBase64;
