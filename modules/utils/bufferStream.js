var Buffer = require('buffer').Buffer;
var Promise = require('bluebird');
var MaxLengthExceededError = require('./MaxLengthExceededError');

/**
 * Returns a promise for a buffer of all content in the given stream up to
 * the given maximum length.
 */
function bufferStream(stream, maxLength) {
  maxLength = maxLength || Infinity;

  return new Promise(function (resolve, reject) {
    if (!stream.readable) {
      reject(new Error('Cannot buffer stream that is not readable'));
      return;
    }

    var chunks = [];
    var length = 0;

    stream.on('error', reject);

    stream.on('data', function (chunk) {
      length += chunk.length;

      if (length > maxLength) {
        reject(new MaxLengthExceededError(maxLength));
      } else {
        chunks.push(chunk);
      }
    });

    stream.on('end', function () {
      resolve(Buffer.concat(chunks));
    });

    if (typeof stream.resume === 'function')
      stream.resume();
  });
}

module.exports = bufferStream;
