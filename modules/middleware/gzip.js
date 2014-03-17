var zlib = require('zlib');
var utils = require('../utils');
module.exports = Gzip;

/**
 * A middleware that gzip's the response content (see http://www.gzip.org/).
 * Options may be any of node's zlib options (see http://nodejs.org/api/zlib.html).
 */
function Gzip(app, options) {
  if (!(this instanceof Gzip))
    return new Gzip(app, options);

  options = options || {};

  this._app = app;
  this._options = options;
}

Gzip.prototype.apply = function (request) {
  return request.call(this._app).then(function (response) {
    if (!shouldGzipContentType(response.headers['Content-Type']) || !request.acceptsEncoding('gzip'))
      return response;

    response.content = this.wrapContent(response.content);
    response.headers['Content-Encoding'] = 'gzip';
    response.headers['Vary'] = 'Accept-Encoding';

    delete response.headers['Content-Length'];

    return response;
  }.bind(this));
};

Gzip.prototype.wrapContent = function (content) {
  return content.pipe(zlib.createGzip(this._options));
};

function shouldGzipContentType(contentType) {
  if (!contentType || contentType === 'text/event-stream')
    return false;

  return (/text|javascript|json/i).test(contentType);
}
