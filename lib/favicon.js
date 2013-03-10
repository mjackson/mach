module.exports = favicon;

/**
 * A middleware that generates a 404 for requests for "/favicon.ico".
 */
function favicon(app) {
  return function (request) {
    return request.path === '/favicon.ico' ? 404 : request.call(app);
  };
}
