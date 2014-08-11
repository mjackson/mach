var parseURL = require('./parseURL');
var stringifyQuery = require('./stringifyQuery');
var Request = require('../../Request');

/**
 * Returns a new Request created using the given options, which may
 * be any of the Request constructor's options or the following:
 *
 * - method     The HTTP method (i.e. GET, POST, etc.)
 * - params     An object of HTTP parameters
 *
 * For convenience, options may be given as a URL string in order
 * to specify protocol, host, path, and query string information.
 */
function createRequest(options) {
  options = options || {};

  // Options may be a URL.
  if (typeof options === 'string') {
    var url = parseURL(options);

    options = {
      protocol: url.protocol,
      serverName: url.hostname,
      serverPort: url.port,
      pathInfo: url.pathname,
      queryString: url.query
    };
  }

  // Params may be given as an object.
  if (options.params) {
    var queryString = stringifyQuery(options.params);
    var upperMethod = (options.method || 'GET').toUpperCase();

    if (upperMethod === 'GET' || upperMethod === 'HEAD') {
      options.queryString = queryString;
    } else {
      if (!options.headers)
        options.headers = {};

      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      options.content = queryString;
    }
  }

  return new Request(options);
}

module.exports = createRequest;
