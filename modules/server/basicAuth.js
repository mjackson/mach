var Promise = require('bluebird');
var decodeBase64 = require('./utils/decodeBase64');
var sendText = require('./utils/responseHelpers').text;

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
function basicAuth(app, options) {
  options = options || {};

  if (typeof options === 'function')
    options = { validate: options };

  if (typeof options.validate !== 'function')
    throw new Error('Missing validation function for basic auth');

  return function (request) {
    if (request.remoteUser)
      return request.call(app); // Don't overwrite existing remoteUser.

    var auth = request.auth;
    if (!auth)
      return unauthorized(options.realm);

    var parts = auth.split(' ');
    var scheme = parts[0];
    if (scheme.toLowerCase() !== 'basic')
      return sendText('Bad Request', 403);

    var params = decodeBase64(parts[1]).split(':');
    var username = params[0];
    var password = params[1];

    return Promise.resolve(options.validate(username, password)).then(function (user) {
      if (!user)
        return unauthorized(options.realm);

      request.remoteUser = (user === true) ? username : user;

      return request.call(app);
    });
  };
}

function unauthorized(realm) {
  realm = realm || 'Authorization Required';

  return sendText('Not Authorized', 401, {
    'WWW-Authenticate': 'Basic realm="' + realm + '"'
  });
}

module.exports = basicAuth;
