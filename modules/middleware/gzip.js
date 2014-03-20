var zlib = require('zlib');
var utils = require('../utils');

/**
 * A middleware that gzip's the response content (see http://www.gzip.org/).
 * Options may be any of node's zlib options (see http://nodejs.org/api/zlib.html).
 */
module.exports = function (app, gzipOptions) {
  return function (request) {
    return request.call(app).then(function (response) {
      var headers = response.headers;

      if (!shouldGzipContentType(headers['Content-Type']) || !request.acceptsEncoding('gzip'))
        return response;

      response.content = response.content.pipe(zlib.createGzip(gzipOptions));

      headers['Content-Encoding'] = 'gzip';
      headers['Vary'] = 'Accept-Encoding';
      delete headers['Content-Length'];

      return response;
    });
  };
};

var gzipTypes = /text|javascript|json/i;

function shouldGzipContentType(contentType) {
  if (!contentType || contentType === 'text/event-stream')
    return false;

  return gzipTypes.test(contentType);
}
