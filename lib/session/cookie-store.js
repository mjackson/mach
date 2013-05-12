var util = require('util');
var when = require('when');
var utils = require('../utils');
var SessionStore = require('./store');
module.exports = CookieStore;

/**
 * Client-side storage for sessions using HTTP cookies.
 *
 * Accepts the following options:
 *
 * - secret       A secret key that will be used to verify the integrity of
 *                session data that is received from the client. This should
 *                always be set when using this storage strategy
 *
 * Note: Cookies are only able to reliably store about 4k of data. Also, sending
 * and receiving large cookies can have a significant impact on overall server
 * response time (see http://yuiblog.com/blog/2007/03/01/performance-research-part-3/).
 * For these reasons, if you are planning on storing a lot of data in the session
 * you may want to use a server-side storage, such as mach.session.RedisStore.
 */
function CookieStore(options) {
  SessionStore.call(this);

  options = options || {};

  this.secret = options.secret;
  if (!this.secret) {
    console.warn([
      'WARNING: There was no "secret" option provided to mach.session.CookieStore!',
      'This poses a security vulnerability because session data will be stored on',
      'clients without any server-side verification that it has not been tampered',
      'with. It is strongly recommended that you set a secret to prevent exploits',
      'that may be attempted using carefully crafted cookies.'
    ].join('\n'));
  }
}

util.inherits(CookieStore, SessionStore);

CookieStore.prototype.load = function (value) {
  var cookie = utils.decodeBase64(value);
  var index = cookie.lastIndexOf('--');
  var data = cookie.substring(0, index);
  var hash = cookie.substring(index + 2);

  if (hash === makeHash(data, this.secret)) {
    try {
      return JSON.parse(data);
    } catch (e) {
      // The cookie does not contain valid JSON. Ignore it.
    }
  }

  return {};
};

CookieStore.prototype.save = function (session) {
  var data = JSON.stringify(session);
  var hash = makeHash(data, this.secret);
  var value = utils.encodeBase64(data + '--' + hash);

  if (value.length > 4096) {
    return when.reject('Cookie data size exceeds 4k; content dropped');
  }

  return value;
};

function makeHash(data, secret) {
  return utils.hash(secret ? data + secret : data);
}
