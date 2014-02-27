var RSVP = require('rsvp');
var utils = require('../../utils');
module.exports = MemoryStore;

/**
 * Basic server-side storage for sessions that exist within a single process.
 * This should never be used in production, but can be useful in development
 * and testing scenarios when there is only a single server instance.
 *
 * Accepts the following options:
 *
 * - keyLength        The length that will be used for unique cache keys.
 *                    Defaults to 32
 * - purgeInterval    The interval (in milliseconds) at which the cache is
 *                    purged of expired sessions. Defaults to 5000
 * - expireAfter      The number of seconds after which sessions expire.
 *                    Defaults to 0 (no expiration)
 */
function MemoryStore(options) {
  options = options || {};

  this.sessions = {};
  this.expires = {};

  this._keyLength = options.keyLength || 32;
  this._timer = _pruneStore(this, options.purgeInterval || 5000);
  this._ttl = options.expireAfter
    ? (1000 * options.expireAfter) // expireAfter is given in seconds
    : 0;
}

MemoryStore.prototype.load = function (value) {
  var expiry = this.expires[value];

  // Verify the session is not expired.
  if (expiry && expiry <= Date.now())
    return RSVP.resolve({});

  return RSVP.resolve(this.sessions[value] || {});
};

MemoryStore.prototype.save = function (session) {
  var key = session._id;
  if (!key)
    key = session._id = _makeUniqueKey(this.sessions, this._keyLength);

  this.sessions[key] = session;

  if (this._ttl)
    this.expires[key] = Date.now() + this._ttl;

  return RSVP.resolve(key);
};

MemoryStore.prototype.purge = function (key) {
  if (key) {
    delete this.sessions[key];
    delete this.expires[key];
  } else {
    this.sessions = {};
    this.expires = {};
  }
};

MemoryStore.prototype.destroy = function () {
  delete this.sessions;
  delete this.expires;

  if (this._timer) {
    clearInterval(this._timer);
    delete this._timer;
  }
};

function _makeUniqueKey(sessions, keyLength) {
  var key;
  do {
    key = utils.makeKey(keyLength);
  } while (sessions[key]);

  return key;
}

function _pruneStore(store, interval) {
  var timer = setInterval(function () {
    var now = Date.now();

    var expiry;
    for (var key in store.expires) {
      expiry = store.expires[key];

      if (expiry && expiry < now)
        store.purge(key);
    }
  }, interval);

  // Don't let this timer keep the event loop running.
  timer.unref();

  return timer;
}
