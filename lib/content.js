var util = require('util');
var Stream = require('stream');
var Readable = Stream.Readable;
var PassThrough = Stream.PassThrough;

module.exports = Content;

/**
 * A Content object represents the content of an HTTP request or response.
 */
function Content(source, options) {
  PassThrough.call(this, options);

  if (source instanceof Readable) {
    source.pipe(this);
  } else if (Buffer.isBuffer(source)) {
    this.length = source.length;
    passBuffer(source, this);
  } else if (typeof source === 'string') {
    source = new Buffer(source);
    this.length = source.length;
    passBuffer(source, this);
  } else {
    throw new Error('Content source must be a Readable, Buffer, or string');
  }
}

util.inherits(Content, PassThrough);

Content.prototype.__defineGetter__('hasFixedLength', function () {
  return typeof this.length === 'number';
});

function passBuffer(buffer, stream) {
  stream._read = function (size) {
    stream.push(buffer);
    stream.push(null);
    buffer = null;
  };
}
