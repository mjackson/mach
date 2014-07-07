var assert = require('assert');
var Parser = require('../multipart/Parser');

/**
 * Parses an entire multipart message synchronously in one shot. Returns an
 * object of all parts in the message, keyed by name, each of which has a
 * "buffer" property that contains the content of that part as a Buffer.
 */
function parseMultipartMessage(buffer, boundary) {
  var parts = {};
  var parser = new Parser(boundary, function (part) {
    parts[part.name] = part;

    var chunks = [];

    part.content.on('data', function (chunk) {
      chunks.push(chunk);
    });

    part.content.on('end', function () {
      part.buffer = Buffer.concat(chunks);
    });
  });

  var writtenLength = parser.execute(buffer);

  // Make sure the whole message was consumed.
  assert.equal(writtenLength, buffer.length, 'Multipart message is incomplete');

  // This will throw if the message was incomplete.
  parser.finish();

  return parts;
}

module.exports = parseMultipartMessage;
