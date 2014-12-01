var Location = require('../Location');
var proxyRequest = require('./proxyRequest');

var MACH_VERSION = require('../version');

/**
 * A proxy is a function that is used to forward a request to
 * a different location and return the response.
 *
 * This function is part of the low-level API and can generally be
 * used more conveniently either through the client methods or the
 * mach.proxy middleware.
 */
function createProxy(location) {
  if (!(location instanceof Location))
    location = new Location(location);

  return function (conn) {
    var headers = conn.request.headers;

    if (!headers['User-Agent'])
      headers['User-Agent'] = 'mach/' + MACH_VERSION;

    return proxyRequest(conn, location.concat(conn.location));
  };
}

module.exports = createProxy;
