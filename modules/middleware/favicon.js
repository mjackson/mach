/**
 * A middleware that returns the given response to requests for "/favicon.ico".
 * Defaults to returning an empty 404.
 */
function favicon(app, response) {
  response = response || 404;

  return function (request) {
    return request.path === '/favicon.ico' ? response : request.call(app);
  };
}

module.exports = favicon;
