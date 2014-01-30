var assert = require('assert');

/**
 * Parses an entire multipart message in one shot. Returns an object of all
 * parts in the message, keyed by name, each of which has a buffer property
 * that represents the the content of that part as a Buffer.
 */
exports.parse = function (buffer, boundary) {
  var parser = new exports.Parser(boundary);

  var parts = {};
  parser.onPart = function (part) {
    parts[part.name] = part;

    var chunks = [];

    part.on('data', function (chunk) {
      chunks.push(chunk);
    });

    part.on('end', function () {
      part.buffer = Buffer.concat(chunks);
    });
  };

  var writtenLength = parser.execute(buffer);

  // Make sure the whole message was consumed.
  assert.equal(writtenLength, buffer.length, 'Multipart message is incomplete');

  // This will throw if the message was incomplete.
  parser.finish();

  return parts;
};

var submodules = {
  Parser:   './multipart/parser',
  Part:     './multipart/part'
};

Object.keys(submodules).forEach(function (name) {
  exports.__defineGetter__(name, function () {
    return require(submodules[name]);
  });
});
