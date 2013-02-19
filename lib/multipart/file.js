var util = require('util');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');

module.exports = File;

/**
 * A container class for data pertaining to a file upload stored on disk.
 * Constructor parameters are:
 *
 *   - path   The full path to the temporary file on disk
 *   - type   The Content-Type of the file
 *   - name   The name of the original file
 */
function File(path, type, name) {
  this.path = path;
  this.type = type;
  this.name = name;
  this.size = 0;
}

util.inherits(File, EventEmitter);

/**
 * Returns the media type of the file, which is the content type with any extra
 * parameters stripped (e.g. "text/plain;charset=utf-8" becomes "text/plain").
 */
File.prototype.__defineGetter__('mediaType', function () {
  return (this.type || '').split(/\s*[;,]\s*/)[0].toLowerCase();
});

File.prototype.write = function (buffer) {
  if (!this._writeStream) {
    this._writeStream = fs.createWriteStream(this.path);
  }

  this.emit('write');

  var self = this;
  this._writeStream.write(buffer, function () {
    self.size += buffer.length;
    self.emit('progress');
  });
};

File.prototype.end = function () {
  var self = this;
  this._writeStream.end(function () {
    delete self._writeStream;
    self.emit('end');
  });
};
