var util = require('util');
var Readable = require('stream').Readable;

module.exports = Content;

/**
 * A Content object represents the content of an HTTP request or response. It
 * is a subclass of Readable.
 */
function Content(source, options) {
  Readable.call(this, options);

  if (source instanceof Readable) {
    proxySource(source, this);
  } else if (Buffer.isBuffer(source)) {
    this.length = source.length;
    bufferSource(source, this);
  } else if (typeof source === 'string') {
    source = new Buffer(source);
    this.length = source.length;
    bufferSource(source, this);
  } else {
    throw new Error('Content source must be a Readable, Buffer, or string');
  }
}

util.inherits(Content, Readable);

Content.prototype.__defineGetter__('hasFixedLength', function () {
  return typeof this.length === 'number';
});

function proxySource(source, stream) {
  source.on('readable', function () {
    stream.push(source.read());
  });

  source.on('end', function () {
    stream.push(null);
  });

  stream._read = function (size) {
    source._read(size);
  };
}

function bufferSource(source, stream) {
  var readCalled = false;

  stream._read = function (size) {
    if (!readCalled) stream.push(source);
    readCalled = true;
    stream.push(null);
  };
}
