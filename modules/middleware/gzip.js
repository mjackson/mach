var zlib = require('zlib');
var mach = require('../index');

mach.extend(
  require('../extensions/acceptEncoding')
);

var GZIP_MATCHER = /text|javascript|json/i;

function shouldGzipContentType(contentType) {
  if (!contentType || contentType === 'text/event-stream')
    return false;

  return GZIP_MATCHER.test(contentType);
}

/**
 * A middleware that gzip's the response content (see http://www.gzip.org/).
 * Options may be any of node's zlib options (see http://nodejs.org/api/zlib.html).
 */
function gzip(app, options) {
  return function (conn) {
    return conn.call(app).then(function () {
      var response = conn.response;
      var headers = response.headers;

      if (shouldGzipContentType(headers['Content-Type']) && conn.acceptsEncoding('gzip')) {
        response.content = response.content.pipe(zlib.createGzip(options));

        delete headers['Content-Length'];
        headers['Content-Encoding'] = 'gzip';
        headers['Vary'] = 'Accept-Encoding';
      }
    });
  };
}

module.exports = gzip;
