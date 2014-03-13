var RSVP = require('rsvp');
var utils = require('../utils');

/**
 * A middleware that performs basic auth on the incoming request before passing
 * it downstream.
 *
 * The `validate` argument must be a function that accepts two arguments: the
 * username and password given in the request. It must return the username to
 * use for the request (or simply `true` to indicate the given username is
 * valid) or a promise for such a value. The validated username is stored in the
 * `remoteUser` request variable.
 *
 * When authorization fails, the client automatically receives a 401 Unauthorized
 * response with the appropriate challenge in the WWW-Authenticate header.
 *
 * Example:
 *
 *   mach.basicAuth(app, function (user, pass) {
 *     // Return a boolean value to indicate the given credentials are valid.
 *     return (user === 'admin' && pass === 'secret');
 *   });
 *
 *   mach.basicAuth(app, function (user, pass) {
 *     // Return a promise for the actual username to use.
 *     return query('SELECT username FROM users WHERE handle=? AND password=?', user, pass);
 *   });
 */
module.exports = function (app, validate, realm) {
  realm = realm || 'Authorization Required';

  if (typeof validate !== 'function')
    throw new Error('Missing validation function for basic auth');

  function basicAuth(request) {
    if (request.remoteUser)
      return request.call(app); // Don't overwrite existing remoteUser.

    var authorization = request.headers.authorization;
    if (!authorization)
      return unauthorized(realm);

    var parts = authorization.split(' ');
    var scheme = parts[0];
    if (scheme.toLowerCase() !== 'basic')
      return utils.badRequest();

    var params = utils.decodeBase64(parts[1]).split(':');
    var username = params[0];
    var password = params[1];

    return RSVP.resolve(validate(username, password)).then(function (user) {
      if (!user)
        return unauthorized(realm);

      request.remoteUser = (user === true) ? username : user;

      return request.call(app);
    });
  }

  return basicAuth;
};

function unauthorized(realm) {
  return {
    status: 401,
    headers: {
      'Content-Type': 'text/plain',
      'WWW-Authenticate': 'Basic realm="' + realm + '"'
    },
    content: 'Not Authorized'
  };
}
