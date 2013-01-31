var zlib = require('zlib');
var utils = require('./utils');

module.exports = gzip;

/**
 * A middleware that gzip encodes the body of the response. The options may be
 * any of node's zlib options (see http://nodejs.org/api/zlib.html) or any of
 * the following:
 *
 *   - types  A regular expression that is used to match the Content-Type
 *            header to determine if the content is able to be gzip'd or
 *            not. Defaults to `/text|javascript|json/i`.
 */
function gzip(app, options) {
  options = options || {};

  var matcher;
  if (utils.isRegExp(options.types)) {
    matcher = options.types;
    delete options.types;
  } else {
    matcher = /text|javascript|json/i;
  }

  return function (request) {
    return request.call(app).then(function (response) {
      var headers = response.headers;
      var contentType = headers['Content-Type'];

      if (contentType && matcher.exec(contentType)) {
        response.content.resume();
        response.content = response.content.pipe(zlib.createGzip(options));
        headers['Content-Encoding'] = 'gzip';
        headers['Vary'] = 'Accept-Encoding';
        delete headers['Content-Length'];
      }

      return response;
    });
  };
}
