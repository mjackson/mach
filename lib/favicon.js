module.exports = favicon;

/**
 * A middleware that generates a 404 for requests for "/favicon.ico".
 */
function favicon(app) {
  return function (request) {
    if (request.path == '/favicon.ico') return 404;
    return request.call(app);
  };
}
