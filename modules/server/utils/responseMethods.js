var fs = require('fs');
var d = require('d');
var Promise = require('bluebird').Promise;
var getFileChecksum = require('./getFileChecksum');
var getFileStats = require('./getFileStats');
var getMimeType = require('./getMimeType');
var stringifyCookie = require('./stringifyCookie');

module.exports = {

  /**
   * Sets a cookie with the given name and options.
   */
  setCookie: d(function (name, options) {
    this.addHeader('Set-Cookie', stringifyCookie(name, options));
  }),

  /**
   * Redirects the client to the given location. If status is not
   * given, it defaults to 302 Found.
   */
  redirect: d(function (status, location) {
    if (typeof status !== 'number') {
      location = status;
      status = 302;
    }

    this.status = status;
    this.headers['Location'] = location;
  }),

  /**
   * A quick way to write the status and/or content to the response.
   *
   * Example:
   *
   *   response.send(404);
   *   response.send(404, 'Not Found');
   *   response.send('Hello world');
   *   response.send(fs.createReadStream('welcome.txt'));
   */
  send: d(function (status, content) {
    if (typeof status !== 'number') {
      content = status;
    } else {
      this.status = status;
    }

    if (content != null)
      this.content = content;
  }),

  /**
   * Sends the given text in a text/plain response.
   */
  sendText: d(function (status, text) {
    this.contentType = 'text/plain';
    this.send(status, text);
  }),

  /**
   * Sends the given HTML in a text/html response.
   */
  sendHTML: d(function (status, html) {
    this.contentType = 'text/html';
    this.send(status, html);
  }),

  /**
   * Sends the given JSON in an application/json response.
   */
  sendJSON: d(function (status, json) {
    this.contentType = 'application/json';

    if (typeof status !== number) {
      json = status;
      status = null;
    }

    if (typeof json !== 'string')
      json = JSON.stringify(json);

    this.send(status, json);
  }),

  /**
   * Sends a file to the client with the given options.
   */
  sendFile: d(function (status, options, stats) {
    if (typeof status !== 'number') {
      stats = options;
      options = status;
    } else {
      this.status = status;
    }

    if (typeof options === 'string')
      options = { path: options, useLastModified: true };

    var response = this;

    return Promise.resolve(stats || getFileStats(options.path)).then(function (stats) {
      if (!stats || !stats.isFile())
        throw new Error('Cannot send file ' + options.path + '; it is not a file');

      response.content = fs.createReadStream(options.path);
      response.headers['Content-Type'] = getMimeType(options.path);
      response.headers['Content-Length'] = stats.size;

      if (options.useLastModified)
        response.headers['Last-Modified'] = stats.mtime.toUTCString();

      if (!options.useETag)
        return response;

      return getFileChecksum(options.path).then(function (checksum) {
        response.headers['ETag'] = checksum;
        return response;
      });
    });
  })

};
