var mach = require('../index');
var Promise = require('../utils/Promise');

mach.extend(
  require('../extensions/server')
);

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
    throw new Error('mach.basicAuth needs a validation function');

  var realm = options.realm || 'Authorization Required';

  return function (conn) {
    if (conn.remoteUser)
      return conn.call(app); // Don't overwrite existing remoteUser.

    var credentials = conn.auth.split(':', 2);
    var username = credentials[0], password = credentials[1];

    return Promise.resolve(options.validate(username, password)).then(function (user) {
      if (user) {
        conn.remoteUser = (user === true) ? username : user;
        return conn.call(app);
      }

      conn.response.headers['WWW-Authenticate'] = 'Basic realm="' + realm + '"';
      conn.text(401, 'Not Authorized');
    });
  };
}

module.exports = basicAuth;
