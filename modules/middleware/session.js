var RSVP = require('rsvp');
var utils = require('../utils');
var CookieStore = require('./session/cookie-store');
module.exports = Session;

var MAX_LENGTH = 4096;

/**
 * A middleware that provides support for HTTP sessions using cookies.
 *
 * Accepts the following options:
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
 * - store          An instance of a mach.session.Store subclass that is used
 *                  to store session data. Defaults to a new instance of
 *                  mach.session.CookieStore
 *
 * Note: Since cookies are only able to reliably store about 4k of data, if the
 * session cookie payload exceeds that the session will be dropped.
 */
function Session(app, options) {
  if (!(this instanceof Session))
    return new Session(app, options);

  options = options || {};

  if (typeof options === 'string')
    options = { secret: options };

  this._secret = options.secret;

  if (!this._secret) {
    console.warn([
      'WARNING: There was no "secret" option provided to mach.session! This poses',
      'a security vulnerability because session data will be stored on clients without',
      'any server-side verification that it has not been tampered with. It is strongly',
      'recommended that you set a secret to prevent exploits that may be attempted using',
      'carefully crafted cookies.'
    ].join('\n'));
  }

  this._name = options.name || '_session';
  this._path = options.path || '/';
  this._domain = options.domain;
  this._secure = options.secure || false;
  this._expireAfter = options.expireAfter || 0;

  if ('httpOnly' in options) {
    this._httpOnly = options.httpOnly || false;
  } else {
    this._httpOnly = true;
  }

  this._store = options.store || new CookieStore(options);
  this._app = app;
}

Session.prototype.apply = function (request) {
  var app = this._app;

  if (request.session)
    return request.call(app); // Don't overwrite the existing session.

  var originalValue = request.cookies[this._name];
  var self = this;

  return RSVP.resolve(originalValue && self.decode(originalValue)).then(function (session) {
    request.session = session || {};

    return request.call(app).then(function (response) {
      return RSVP.resolve(request.session && self.encode(request.session)).then(function (value) {
        var expires = self._expireAfter && new Date(Date.now() + (self._expireAfter * 1000));

        // Don't bother setting the cookie if its value
        // hasn't changed and there is no expires date.
        if (value === originalValue && !expires)
          return response;

        utils.setCookie(response.headers, self._name, {
          value: value,
          path: self._path,
          domain: self._domain,
          expires: expires,
          httpOnly: self._httpOnly,
          secure: self._secure
        });

        return response;
      }, function (error) {
        request.error.write('Error encoding session data: ' + error);
        return response;
      });
    });
  }, function (error) {
    request.error.write('Error decoding session data: ' + error);
    return request.call(app);
  });
};

Session.prototype.decode = function (value) {
  var signedValue = utils.decodeBase64(value);
  var index = signedValue.lastIndexOf('--');
  var data = signedValue.substring(0, index);
  var hash = signedValue.substring(index + 2);

  // Verify the cookie has not been tampered with.
  if (hash !== makeHash(data, this._secret))
    return {};

  return this._store.load(data);
};

Session.prototype.encode = function (session) {
  var secret = this._secret;

  return this._store.save(session).then(function (data) {
    var value = utils.encodeBase64(data + '--' + makeHash(data, secret));

    if (value.length > MAX_LENGTH)
      return RSVP.reject('Cookie data size exceeds 4k; content dropped');

    return value;
  });
};

function makeHash(data, secret) {
  return utils.makeHash(secret ? data + secret : data);
}

var submodules = {
  CookieStore: './session/cookie-store',
  MemoryStore: './session/memory-store',
  RedisStore:  './session/redis-store'
};

Object.keys(submodules).forEach(function (name) {
  module.exports.__defineGetter__(name, function () {
    return require(submodules[name]);
  });
});
