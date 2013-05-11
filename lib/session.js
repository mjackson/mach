var when = require('when');
var utils = require('./utils');
var CookieStore = require('./session/cookie-store');
module.exports = sessionMiddleware;

/**
 * A middleware that persists sessions using server-side storage.
 */
function sessionMiddleware(app, options) {
  options = options || {};

  var name = options.name || '_session';
  var path = options.path || '/';
  var domain = options.domain;
  var secure = options.secure || false;
  var expireAfter = options.expireAfter;

  var httpOnly;
  if ('httpOnly' in options) {
    httpOnly = options.httpOnly || false;
  } else {
    httpOnly = true;
  }

  var store = options.store || new CookieStore(options);

  return function (request) {
    if (request.session) return request.call(app);

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
              secure: secure
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
}

var submodules = {
  CookieStore:    './session/cookie-store',
  MemoryStore:    './session/memory-store',
  RedisStore:     './session/redis-store',
  Store:          './session/store'
};

Object.keys(submodules).forEach(function (name) {
  sessionMiddleware.__defineGetter__(name, function () {
    return require(submodules[name]);
  });
});
