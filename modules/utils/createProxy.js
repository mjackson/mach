var Location = require('../Location');
var sendRequest = require('./sendRequest');

/**
 * A proxy is a function that is used to forward a request to
 * a different location and return the response.
 *
 * This function is part of the low-level API and can generally be
 * used more conveniently through the mach.proxy middleware.
 */
function createProxy(location) {
  if (!(location instanceof Location))
    location = new Location(location);

  return function (conn) {
    // Only concat the path from the connection so the protocol,
    // auth, and host from the original location are preserved.
    conn.proxyLocation = location.concat(conn.path);

    return sendRequest(conn, conn.proxyLocation);
  };
}

module.exports = createProxy;
