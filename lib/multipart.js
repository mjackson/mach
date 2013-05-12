var multipart = module.exports;

var submodules = {
  Parser:   './multipart/parser',
  Part:     './multipart/part'
};

Object.keys(submodules).forEach(function (name) {
  multipart.__defineGetter__(name, function () {
    return require(submodules[name]);
  });
});

var assert = require('assert');

/**
 * Parses an entire multipart message in one shot. Returns an object of all
 * parts in the message, keyed by name, each of which has a buffer property
 * that represents the the content of that part as a Buffer.
 */
multipart.parse = parse;
function parse(buffer, boundary) {
  var parser = new multipart.Parser(boundary);

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
  assert.equal(writtenLength, buffer.length);

  // This will throw if the message was incomplete.
  parser.finish();

  return parts;
}
