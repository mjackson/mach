var mach = require('../index');
var makeToken = require('../utils/makeToken');

mach.extend(
  require('../extensions/server')
);

/**
 * The set of HTTP request methods that are considered safe because they
 * do not alter server data.
 */
var SAFE_METHODS = {
  GET: true,
  HEAD: true,
  OPTIONS: true,
  TRACE: true
};

/**
 * A middleware that helps to prevent Cross-site Request Forgery attacks by
 * requiring the client to include an authentication token in all form
 * submissions that matches a value stored in the session cookie. See
 * http://www.codinghorror.com/blog/2008/10/preventing-csrf-and-xsrf-attacks.html
 *
 * If the session does not already have an authentication token one is
 * automatically generated and stored in the session. The default session key
 * is "_token". All form submissions need to include this value in the "_token"
 * parameter, like this:
 *
 *   <form method="POST" action="/">
 *     <input type="hidden" name="_token" value="{{session._token}}">
 *   </form>
 *
 * On the backend, you need to put both mach.session and mach.params in front of
 * mach.token in order for it to be able to retrieve values from the request session
 * and parameters, like this:
 *
 *   app.use(mach.session);
 *   app.use(mach.params);
 *   app.use(mach.token);
 *   app.run(function (conn) {
 *     // The connection authenticated successfully
 *   });
 *
 * Options may be any of the following:
 *
 * - paramName        The name of the request parameter that contains the token
 *                    (i.e. the value of the "name" attribute on your <input>).
 *                    Defaults to "_token"
 * - sessionKey       The name of the session variable to use to store the token.
 *                    Defaults to "_token"
 * - byteLength       The length of the token in bytes. Defaults to 32
 *
 * Note: Non-POST requests are always forwarded to the downstream app regardless of
 * whether or not they contain the token since it is assumed they are not modifying
 * anything and are safe.
 */
function verifyToken(app, options) {
  options = options || {};

  if (typeof options === 'string')
    options = { paramName: options };

  var paramName = options.paramName || '_token';
  var sessionKey = options.sessionKey || '_token';
  var byteLength = options.byteLength || 32;

  return function (conn) {
    var session = conn.session, params = conn.params;

    if (!session) {
      conn.onError(new Error('No session! Use mach.session in front of mach.token'));
    } else if (!params) {
      conn.onError(new Error('No params! Use mach.params in front of mach.token'));
    } else {
      var token = session[sessionKey];

      // Create a new session token if needed.
      if (!token)
        token = session[sessionKey] = makeToken(byteLength);

      if (params[paramName] && params[paramName] === token)
        return conn.call(app);
    }

    // If the request is not a POST we assume it's not a form submission
    // and therefore not modifying anything. Pass it downstream.
    if (SAFE_METHODS[conn.method] === true)
      return conn.call(app);

    conn.text(403, 'Forbidden');
  };
}

module.exports = verifyToken;
