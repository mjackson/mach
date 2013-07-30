module.exports = makeFavicon;

/**
 * A middleware that generates a 404 for requests for "/favicon.ico".
 */
function makeFavicon(app) {
  function favicon(request) {
    return request.path === '/favicon.ico' ? 404 : request.call(app);
  }

  return favicon;
}
