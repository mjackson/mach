var crypto = require('crypto');

/**
 * Returns a SHA1 hash of the given string.
 */
function makeHash(string) {
  return crypto.createHash('sha1').update(string).digest('hex');
}

module.exports = makeHash;
