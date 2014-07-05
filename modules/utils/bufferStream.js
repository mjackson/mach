var Promise = require('bluebird');
var MaxLengthExceededError = require('../errors/MaxLengthExceededError');

/**
 * Returns a promise for a buffer of all content in the given stream up to
 * the given maximum length.
 */
function bufferStream(stream, maxLength) {
  return new Promise(function (resolve, reject) {
    if (!stream.readable) {
      reject(new Error('Cannot buffer stream that is not readable'));
    } else {
      var chunks = [];
      var length = 0;

      stream.on('error', reject);

      stream.on('data', function (chunk) {
        length += chunk.length;

        if (maxLength && length > maxLength) {
          reject(new MaxLengthExceededError(maxLength));
        } else {
          chunks.push(chunk);
        }
      });

      stream.on('end', function () {
        resolve(Buffer.concat(chunks));
      });
    }
  });
}

module.exports = bufferStream;
