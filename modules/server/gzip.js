var zlib = require('zlib');

var gzipTypes = /text|javascript|json/i;

function shouldGzipContentType(contentType) {
  if (!contentType || contentType === 'text/event-stream')
    return false;

  return gzipTypes.test(contentType);
}

/**
 * A middleware that gzip's the response content (see http://www.gzip.org/).
 * Options may be any of node's zlib options (see http://nodejs.org/api/zlib.html).
 */
function gzip(app, options) {
  return function (request) {
    return request.call(app).then(function (response) {
      var headers = response.headers;

      if (!shouldGzipContentType(headers['Content-Type']) || !request.acceptsEncoding('gzip'))
        return response;

      response.content = response.content.pipe(zlib.createGzip(options));

      delete headers['Content-Length'];
      headers['Content-Encoding'] = 'gzip';
      headers['Vary'] = 'Accept-Encoding';

      return response;
    });
  };
}

module.exports = gzip;
