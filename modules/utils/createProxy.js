var Location = require('../Location');
var proxyRequest = require('./proxyRequest');

var MACH_VERSION = require('../version');

/**
 * A mach.proxy is a function that is used to proxy a connection to
 * a different location.
 *
 * This function is part of the low-level API and can generally be
 * used more conveniently either through the client methods or the
 * mach.forward middleware.
 */
function createProxy(location) {
  if (!(location instanceof Location))
    location = new Location(location);

  return function (conn) {
    var headers = conn.request.headers;

    if (!headers['User-Agent'])
      headers['User-Agent'] = 'mach/' + VERSION;

    return proxyRequest(conn, location);
  };
}

module.exports = createProxy;
