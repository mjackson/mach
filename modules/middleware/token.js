var utils = require('../utils');

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
 */
module.exports = function (app, options) {
  options = options || {};

  if (typeof options === 'string')
    options = { paramName: options };

  var paramName = options.paramName || '_token';
  var sessionKey = options.sessionKey || '_token';
  var byteLength = options.byteLength || 32;

  return function (request) {
    var session = request.session;
    var params = request.params;

    if (!session) {
      request.error.write('No request session. Use mach.session in front of mach.token\n');
    } else if (!params) {
      request.error.write('No request params. Use mach.params in front of mach.token\n');
    } else {
      // Get the session token, creating a new one if needed.
      var token = session[sessionKey];
      if (!token)
        token = session[sessionKey] = utils.makeToken(byteLength);

      if (params[paramName] && params[paramName] === token)
        return request.call(app);
    }

    // If the request is not a POST we assume it's not a form submission
    // and therefore not modifying anything. Pass it downstream.
    if (utils.isSafeRequestMethod(request.method))
      return request.call(app);

    return utils.forbidden();
  };
};
