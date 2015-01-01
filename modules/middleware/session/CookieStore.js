var d = require('describe-property');
var Promise = require('../../utils/Promise');

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

  this.ttl = options.expireAfter
    ? (1000 * options.expireAfter) // expireAfter is given in seconds
    : 0;
}

Object.defineProperties(CookieStore.prototype, {

  load: d(function (value) {
    var session;
    try {
      session = JSON.parse(value);
    } catch (error) {
      // Ignore invalid JSON data.
      return Promise.resolve({});
    }

    // Verify the session is not expired.
    if (session._expiry && session._expiry <= Date.now())
      return Promise.resolve({});

    return Promise.resolve(session);
  }),

  save: d(function (session) {
    if (this.ttl)
      session._expiry = Date.now() + this.ttl;

    return Promise.resolve(JSON.stringify(session));
  })

});

module.exports = CookieStore;
