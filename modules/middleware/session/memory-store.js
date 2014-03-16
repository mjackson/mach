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
 * - keyLength        The length (in bytes) that will be used for unique cache keys.
 *                    Defaults to 32
 * - purgeInterval    The interval (in milliseconds) at which the cache is
 *                    purged of expired sessions. Defaults to 5000
 * - expireAfter      The number of seconds after which sessions expire.
 *                    Defaults to 0 (no expiration)
 */
function MemoryStore(options) {
  options = options || {};

  this.sessions = {};

  this._keyLength = options.keyLength || 32;
  this._timer = _pruneStore(this, options.purgeInterval || 5000);
  this._ttl = options.expireAfter
    ? (1000 * options.expireAfter) // expireAfter is given in seconds
    : 0;
}

MemoryStore.prototype.load = function (value) {
  var session = this.sessions[value];

  if (!session)
    return RSVP.resolve({});

  // Verify the session is not expired.
  if (session._expiry && session._expiry <= Date.now())
    return RSVP.resolve({});

  return RSVP.resolve(session);
};

MemoryStore.prototype.save = function (session) {
  var key = session._id;
  if (!key)
    key = session._id = _makeUniqueKey(this.sessions, this._keyLength);

  if (this._ttl)
    session._expiry = Date.now() + this._ttl;

  this.sessions[key] = session;

  return RSVP.resolve(key);
};

MemoryStore.prototype.purge = function (key) {
  if (key) {
    delete this.sessions[key];
  } else {
    this.sessions = {};
  }
};

MemoryStore.prototype.destroy = function () {
  delete this.sessions;

  if (this._timer) {
    clearInterval(this._timer);
    delete this._timer;
  }
};

function _makeUniqueKey(sessions, keyLength) {
  var key;
  do {
    key = utils.makeToken(keyLength);
  } while (sessions[key]);

  return key;
}

function _pruneStore(store, interval) {
  var timer = setInterval(function () {
    var now = Date.now();

    var session;
    for (var key in store.sessions) {
      session = store.sessions[key];

      if (session._expiry && session._expiry < now)
        store.purge(key);
    }
  }, interval);

  // Don't let this timer keep the event loop running.
  timer.unref();

  return timer;
}
