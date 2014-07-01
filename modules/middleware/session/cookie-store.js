var Promise = require('bluebird');
module.exports = CookieStore;

/**
 * Client-side storage for sessions using HTTP cookies.
 *
 * Accepts the following options:
 *
 * - expireAfter      The number of seconds after which sessions expire.
 *                    Defaults to 0 (no expiration)
 *
 * Note: Cookies are only able to reliably store about 4k of data. Also, sending
 * and receiving large cookies can have a significant impact on overall server
 * response time (see http://yuiblog.com/blog/2007/03/01/performance-research-part-3/).
 * For these reasons, if you are planning on storing a lot of data in the session
 * you may want to use a server-side storage, such as mach.session.RedisStore.
 */
function CookieStore(options) {
  options = options || {};

  this._ttl = options.expireAfter
    ? (1000 * options.expireAfter) // expireAfter is given in seconds
    : 0;
}

CookieStore.prototype.load = function (value) {
  try {
    var session = JSON.parse(value);
  } catch (error) {
    // Ignore invalid JSON data.
    return Promise.resolve({});
  }

  // Verify the session is not expired.
  if (session._expiry && session._expiry <= Date.now())
    return Promise.resolve({});

  return Promise.resolve(session);
};

CookieStore.prototype.save = function (session) {
  if (this._ttl)
    session._expiry = Date.now() + this._ttl;

  return Promise.resolve(JSON.stringify(session));
};
