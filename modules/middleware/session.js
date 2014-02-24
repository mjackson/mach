var when = require('when');
var utils = require('../utils');
var CookieStore = require('./session/cookie-store');

/**
 * A middleware that provides light-weight HTTP sessions. Accepts the following
 * options:
 *
 * - name           The name of the cookie. Defaults to "_session"
 * - path           The path of the cookie. Defaults to "/"
 * - domain         The cookie's domain. Defaults to null
 * - secure         True to only send this cookie over HTTPS. Defaults to false
 * - expireAfter    The number of seconds after which the session cookie will
 *                  expire. Defaults to 0 (no expiration)
 * - httpOnly       True to restrict access to this cookie to HTTP(S) APIs.
 *                  Defaults to true
 * - store          An instance of a mach.session.Store subclass that is used
 *                  to store session data. Defaults to a new instance of
 *                  mach.session.CookieStore
 *
 * mach includes several different storage strategies depending on the needs of
 * your app. To store sessions on the client, use mach.session.CookieStore. On
 * the server use mach.session.MemoryStore in development or
 * mach.session.RedisStore in production.
 */
module.exports = function (app, options) {
  options = options || {};

  var name = options.name || '_session';
  var path = options.path || '/';
  var domain = options.domain;
  var isSecure = options.secure || false;
  var expireAfter = options.expireAfter || 0;

  var httpOnly;
  if ('httpOnly' in options) {
    httpOnly = options.httpOnly || false;
  } else {
    httpOnly = true;
  }

  var store = options.store || new CookieStore(options);

  return function (request) {
    if (request.session) {
      return request.call(app); // Don't overwrite existing session.
    }

    var originalValue = request.cookies[name];

    var session;
    if (originalValue) {
      session = store.load(originalValue);
    }

    return when(session, function (session) {
      request.session = session || {};

      return request.call(app).then(function (response) {
        var value;
        if (request.session) {
          value = store.save(request.session);
        }

        return when(value, function (value) {
          var expires;
          if (expireAfter) {
            // expireAfter is given in seconds.
            expires = new Date(Date.now() + (expireAfter * 1000));
          }

          // Don't bother setting the cookie if its value
          // hasn't changed and there is no expires date.
          if (value !== originalValue || expires) {
            utils.setCookie(response.headers, name, {
              value: value,
              path: path,
              domain: domain,
              expires: expires,
              httpOnly: httpOnly,
              secure: isSecure
            });
          }

          return response;
        }, function (error) {
          request.error.write('Error saving session data: ' + error);
          return response;
        });
      });
    }, function (error) {
      request.error.write('Error loading session data: ' + error);
      return request.call(app);
    });
  };
};

var submodules = {
  CookieStore:    './session/cookie-store',
  MemoryStore:    './session/memory-store',
  RedisStore:     './session/redis-store',
  Store:          './session/store'
};

Object.keys(submodules).forEach(function (name) {
  module.exports.__defineGetter__(name, function () {
    return require(submodules[name]);
  });
});
