var zlib = require('zlib');
var utils = require('../utils');
module.exports = Gzip;

/**
 * A middleware that encodes the body of the response using Gzip. The options
 * may be any of node's zlib options (see http://nodejs.org/api/zlib.html) or
 * any of the following:
 *
 *   - test   A function that tests the response to see if it should be gzip'd
 *            or not. Should return a boolean. Defaults to checking the value of
 *            the Content-Type header for values that are able to be compressed.
 */
function Gzip(app, options) {
  if (!(this instanceof Gzip))
    return new Gzip(app, options);

  options = options || {};

  var gzipTest;
  if (typeof options.test === 'function') {
    gzipTest = options.test;
    delete options.test;
  } else {
    gzipTest = canGzip;
  } 

  this._app = app;
  this._gzipTest = gzipTest;
  this._gzipOptions = options;
}

Gzip.prototype.apply = function (request) {
  return request.call(this._app).then(function (response) {
    if (this._gzipTest(response)) {
      response.content = this.wrapContent(response.content);
      response.headers['Content-Encoding'] = 'gzip';
      response.headers['Vary'] = 'Accept-Encoding';
      delete response.headers['Content-Length'];
    }

    return response;
  }.bind(this));
};

Gzip.prototype.wrapContent = function (content) {
  return content.pipe(zlib.createGzip(this._gzipOptions));
};

function canGzip(response) {
  var contentType = response.headers['Content-Type'];

  if (!contentType || contentType === 'text/event-stream')
    return false;

  return (/text|javascript|json/i).test(contentType);
}
