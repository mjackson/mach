var mach = require('../index');
var Promise = require('../utils/Promise');
var decodeBase64 = require('../utils/decodeBase64');
var encodeBase64 = require('../utils/encodeBase64');
var makeHash = require('../utils/makeHash');
var CookieStore = require('./session/CookieStore');

mach.extend(
  require('../extensions/server')
);

/**
 * The maximum size of an HTTP cookie.
 */
var MAX_COOKIE_SIZE = 4096;

/**
 * Stores the given session and returns a promise for a value that should be stored
 * in the session cookie to retrieve the session data again on the next request.
 */
function encodeSession(session, store, secret) {
  return store.save(session).then(function (data) {
    var cookie = encodeBase64(data + '--' + makeHashWithSecret(data, secret));

    if (cookie.length > MAX_COOKIE_SIZE)
      throw new Error('Cookie data size exceeds 4kb; content dropped');

    return cookie;
  });
}

/**
 * Decodes the given cookie value and returns a promise for the corresponding session
 * data from the store. Also verifies the hash value to ensure the cookie has not been
 * tampered with. If it has, returns null.
 */
function decodeCookie(cookie, store, secret) {
  var value = decodeBase64(cookie);
  var index = value.lastIndexOf('--');
  var data = value.substring(0, index);
  var hash = value.substring(index + 2);

  // Verify the cookie has not been tampered with.
  if (hash === makeHashWithSecret(data, secret))
    return store.load(data);

  return null;
}

function makeHashWithSecret(data, secret) {
  return makeHash(secret ? data + secret : data);
}

/**
 * A middleware that provides support for HTTP sessions using cookies.
 *
 * Options may be any of the following:
 *
 * - secret         A cryptographically secure secret key that will be used to verify
 *                  the integrity of session data that is received from the client
 * - name           The name of the cookie. Defaults to "_session"
 * - path           The path of the cookie. Defaults to "/"
 * - domain         The cookie's domain. Defaults to null
 * - secure         True to only send this cookie over HTTPS. Defaults to false
 * - expireAfter    The number of seconds after which sessions expire. Defaults
 *                  to 0 (no expiration)
 * - httpOnly       True to restrict access to this cookie to HTTP(S) APIs.
 *                  Defaults to true
 * - store          An instance of MemoryStore, CookieStore, or RedisStore that
 *                  is used to store session data. Defaults to a new CookieStore
 *
 * Example:
 *
 *   app.use(mach.session, {
 *     secret: 'the-secret',
 *     secure: true
 *   });
 *
 * Hint: A great way to generate a cryptographically secure session secret from
 * the command line:
 *
 *   $ node -p "require('crypto').randomBytes(64).toString('hex')"
 *
 * Note: Since cookies are only able to reliably store about 4k of data, if the
 * session cookie payload exceeds that the session will be dropped.
 */
function session(app, options) {
  options = options || {};

  if (typeof options === 'string')
    options = { secret: options };

  var secret = options.secret;
  var name = options.name || '_session';
  var path = options.path || '/';
  var domain = options.domain;
  var expireAfter = options.expireAfter || 0;
  var httpOnly = ('httpOnly' in options) ? (options.httpOnly || false) : true;
  var secure = options.secure || false;
  var store = options.store || new CookieStore(options);

  if (!secret) {
    console.warn([
      'WARNING: There was no "secret" option provided to mach.session! This poses',
      'a security vulnerability because session data will be stored on clients without',
      'any server-side verification that it has not been tampered with. It is strongly',
      'recommended that you set a secret to prevent exploits that may be attempted using',
      'carefully crafted cookies.'
    ].join('\n'));
  }

  return function (conn) {
    if (conn.session)
      return conn.call(app); // Don't overwrite the existing session.

    var cookie = conn.request.cookies[name];

    return Promise.resolve(cookie && decodeCookie(cookie, store, secret)).then(function (object) {
      conn.session = object || {};

      return conn.call(app).then(function () {
        return Promise.resolve(conn.session && encodeSession(conn.session, store, secret)).then(function (newCookie) {
          var expires = expireAfter && new Date(Date.now() + (expireAfter * 1000));

          // Don't bother setting the cookie if its value
          // hasn't changed and there is no expires date.
          if (newCookie === cookie && !expires)
            return;

          conn.response.setCookie(name, {
            value: newCookie,
            path: path,
            domain: domain,
            expires: expires,
            httpOnly: httpOnly,
            secure: secure
          });
        }, conn.onError);
      });
    }, conn.onError);
  };
}

module.exports = session;
