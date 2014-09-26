var makeToken = require('./utils/makeToken');

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
 *   app.run(function (request) {
 *     // The request was authenticated successfully.
 *   });
 *
 * Options may be any of the following:
 *
 *   - paramName        The name of the request parameter that contains the token
 *                      (i.e. the value of the "name" attribute on your <input>).
 *                      Defaults to "_token"
 *   - sessionKey       The name of the session variable to use to store the token.
 *                      Defaults to "_token"
 *   - byteLength       The length of the token in bytes. Defaults to 32
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

  return function (request, response) {
    var session = request.session;
    var params = request.params;

    if (!session) {
      request.onError('No request session. Use mach.session in front of mach.token');
    } else if (!params) {
      request.onError('No request params. Use mach.params in front of mach.token');
    } else {
      var token = session[sessionKey];

      // Create a new session token if needed.
      if (!token)
        token = session[sessionKey] = makeToken(byteLength);

      if (params[paramName] && params[paramName] === token)
        return request.call(app);
    }

    // If the request is not a POST we assume it's not a form submission
    // and therefore not modifying anything. Pass it downstream.
    if (SAFE_METHODS[request.method] === true)
      return request.call(app);

    return response.text(403, 'Forbidden');
  };
}

module.exports = verifyToken;
