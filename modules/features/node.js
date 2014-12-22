/**
 * All features are required by default in node.js
 */
require('./accept');
require('./client');
require('./multipart');
require('./server');

var d = require('d');
var fs = require('fs');
var mach = require('../index');
var getMimeType = require('../utils/getMimeType');
var streamPartToDisk = require('../utils/streamPartToDisk');
var _handlePart = mach.Message.prototype.handlePart;

// Expose all middleware on mach, e.g. as mach.file.
var middleware = require('../middleware');

for (var property in middleware)
  if (middleware.hasOwnProperty(property))
    Object.defineProperty(mach, property, d(middleware[property]));

Object.defineProperties(mach, {

  bind: d(require('../utils/bindApp')),
  createConnection: d(require('../utils/createConnection')),
  serve: d(require('../utils/serveApp'))

});

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
