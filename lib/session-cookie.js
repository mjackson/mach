var utils = require('./utils');
module.exports = sessionCookie;

/**
 * A middleware for storing and retrieving session data using HTTP cookies.
 * The options may be any of the following:
 *
 *   - name         The name of the cookie, defaults to "_session"
 *   - path         The path of the cookie, defaults to "/"
 *   - domain       The cookie's domain, defaults to null
 *   - secret       A secret string to use to verify the cookie's contents,
 *                  defaults to null. If this is set the session's contents
 *                  will be cleared if the cookie has been tampered with
 *   - secure       True to only send this cookie over HTTPS, defaults to false
 *   - expireAfter  A number of seconds after which this cookie will expire
 *   - httpOnly     True to restrict access to this cookie to HTTP(S) APIs,
 *                  defaults to true
 */
function sessionCookie(app, options) {
  options = options || {};

  var name = options.name || '_session';
  var path = options.path || '/';
  var domain = options.domain;
  var secret = options.secret;
  var secure = options.secure || false;
  var expireAfter = options.expireAfter;

  var httpOnly;
  if ('httpOnly' in options) {
    httpOnly = options.httpOnly || false;
  } else {
    httpOnly = true;
  }

  return function (request) {
    if (request.session) return request.call(app);

    // Try to get session data from the cookie.
    var rawCookie = request.cookies[name];
    if (rawCookie) {
      var cookie = utils.decodeBase64(rawCookie);
      var index = cookie.lastIndexOf('--');
      var data = cookie.substring(0, index);
      var hash = cookie.substring(index + 2);

      if (hash === makeHash(data, secret)) {
        try {
          request.session = JSON.parse(data);
        } catch (e) {
          // The cookie does not contain valid JSON. Ignore it.
        }
      }
    }

    if (!request.session) request.session = {};

    return request.call(app).then(function (response) {
      var session = request.session;

      if (session) {
        var data = JSON.stringify(session);
        var hash = makeHash(data, secret);
        var value = utils.encodeBase64(data + '--' + hash);

        if (value.length > 4096) {
          request.error.write('Session cookie data size exceeds 4k; content dropped\n');
        } else {
          var expires;
          if (expireAfter) {
            // expireAfter is given in seconds.
            expires = new Date(Date.now() + (expireAfter * 1000));
          }

          response.headers['Set-Cookie'] = utils.encodeCookie(name, {
            value: value,
            path: path,
            domain: domain,
            expires: expires,
            secure: secure,
            httpOnly: httpOnly
          });
        }
      }

      return response;
    });
  };
}

function makeHash(data, secret) {
  return utils.hash(secret ? data + secret : data);
}
