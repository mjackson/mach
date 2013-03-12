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
  } else if (typeof source === 'string') {
    this._buffer = new Buffer(source);
    this.length = this._buffer.length;
  } else if (Buffer.isBuffer(source)) {
    this._buffer = source;
    this.length = source.length;
  } else {
    throw new Error('Content source must be a Readable, string, or Buffer');
  }
}

util.inherits(Content, Readable);

Content.prototype._read = function (size) {
  if (this._buffer) {
    this.push(this._buffer);
    delete this._buffer;
  }

  this.push(null);
};

Content.prototype.__defineGetter__('hasFixedLength', function () {
  return typeof this.length === 'number';
});

function proxySource(from, to) {
  from.on('readable', function () {
    to.push(from.read());
  });

  from.on('end', function () {
    to.push(null);
  });

  to._read = function (size) {
    from._read(size);
  };
}
