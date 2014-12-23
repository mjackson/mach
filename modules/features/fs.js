var fs = require('fs');
var d = require('d');
var mach = require('../index');
var getMimeType = require('../utils/getMimeType');
var streamPartToDisk = require('../utils/streamPartToDisk');

Object.defineProperties(mach.Connection.prototype, {

  /**
   * Sends a file to the client with the given options.
   *
   * Examples:
   *
   *   response.file('path/to/file.txt');
   *   response.file(200, 'path/to/file.txt');
   */
  file: d(function (status, options) {
    if (typeof status === 'number') {
      this.status = status;
    } else {
      options = status;
    }

    var response = this.response;

    if (typeof options === 'string')
      options = { path: options };

    if (options.content) {
      response.content = options.content;
    } else if (typeof options.path === 'string') {
      response.headers['Content-Length'] = fs.statSync(options.path).size;
      response.content = fs.createReadStream(options.path);
    } else {
      throw new Error('Missing file content/path');
    }

    if (options.type || options.path)
      response.headers['Content-Type'] = options.type || getMimeType(options.path);

    if (options.length || options.size)
      response.headers['Content-Length'] = options.length || options.size;
  })

});

var _handlePart = mach.Message.prototype.handlePart;

Object.defineProperties(mach.Message.prototype, {

  /**
   * Override Message#handlePart to enable streaming file uploads to
   * disk when parsing multipart messages.
   */
  handlePart: d(function (part, uploadPrefix) {
    return part.isFile ? streamPartToDisk(part, uploadPrefix) : _handlePart.apply(this, arguments);
  })

});

module.exports = mach;
