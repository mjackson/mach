var Location = require('../Location');
var proxyRequest = require('./proxyRequest');

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
    return proxyRequest(conn, location);
  };
}

module.exports = createProxy;
