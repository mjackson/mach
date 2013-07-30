var zlib = require('zlib');
var utils = require('./utils');
module.exports = makeGzip;

/**
 * A middleware that gzip encodes the body of the response. The options may be
 * any of node's zlib options (see http://nodejs.org/api/zlib.html) or any of
 * the following:
 *
 *   - test   A function that tests the response to see if it should be gzip'd
 *            or not. Should return a boolean. Defaults to checking the value of
 *            the Content-Type header for values that are able to be compressed.
 */
function makeGzip(app, options) {
  options = options || {};

  var gzipTest;
  if (typeof options.test === 'function') {
    gzipTest = options.test;
    delete options.test;
  } else {
    gzipTest = canGzip;
  }

  function gzip(request) {
    return request.call(app).then(function (response) {
      if (gzipTest(response)) {
        response.content = response.content.pipe(zlib.createGzip(options));
        response.headers['Content-Encoding'] = 'gzip';
        response.headers['Vary'] = 'Accept-Encoding';
        delete response.headers['Content-Length'];
      }

      return response;
    });
  }

  return gzip;
}

function canGzip(response) {
  var contentType = response.headers['Content-Type'];
  if (!contentType || contentType === 'text/event-stream') return false;
  return (/text|javascript|json/i).test(contentType);
}
