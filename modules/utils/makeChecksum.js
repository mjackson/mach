var fs = require('fs');
var crypto = require('crypto');
var Promise = require('bluebird');

/**
 * Returns a promise for the MD5 checksum of all data in the given file.
 */
function makeChecksum(file) {
  return new Promise(function (resolve, reject) {
    var hash = crypto.createHash('md5');
    var stream = fs.createReadStream(file);

    stream.on('error', reject);

    stream.on('data', function (chunk) {
      hash.update(chunk);
    });

    stream.on('end', function () {
      resolve(hash.digest('hex'));
    });
  });
}

module.exports = makeChecksum;
