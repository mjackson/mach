/**
 * A middleware that returns the given response to requests for "/favicon.ico".
 * Defaults to returning an empty 404.
 */
function favicon(app, response) {
  response = response || 404;

  return function (conn) {
    return conn.pathname === '/favicon.ico' ? response : conn.call(app);
  };
}

module.exports = favicon;
