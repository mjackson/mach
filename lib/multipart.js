var assert = require('assert');
var Parser = require('./multipart/parser');
var Part = require('./multipart/part');
var multipart = module.exports;

multipart.Parser = Parser;
multipart.Part = Part;

// A synchronous convenience method for parsing an entire multipart message
// in one shot. Returns an object of all parts in the message, keyed by name.
// Each part will have a buffer property that represents the the content of
// that part as a Buffer.
multipart.parse = parse;
function parse(buffer, boundary) {
  var parser = new Parser(boundary);

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

  // Make sure we consume the whole message.
  var writtenLength = parser.execute(buffer);
  assert.equal(writtenLength, buffer.length);

  // This will throw if the message was incomplete.
  parser.finish();

  return parts;
}
