/**
 * A middleware that generates a 404 for requests for "/favicon.ico".
 */
module.exports = function (app) {
  return function (request) {
    return request.path === '/favicon.ico' ? 404 : request.call(app);
  };
};
