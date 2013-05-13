var util = require('util');
var utils = require('../utils');
var SessionStore = require('./store');
module.exports = MemoryStore;

/**
 * Basic server-side storage for sessions that exist within a single process.
 * This should never be used in production, but can be useful in development
 * and testing scenarios when there is only a single server instance.
 *
 * Accepts the following options:
 *
 * - expireAfter      The time (in seconds) after which sessions expire.
 *                    Defaults to 0 (no expiration)
 * - keyLength        The length that will be used for unique cache keys.
 *                    Defaults to 32
 * - interval         The interval (in milliseconds) at which the cache is
 *                    purged of expired sessions. Defaults to 5000
 */
function MemoryStore(options) {
  options = options || {};

  SessionStore.call(this, options);

  this.sessions = {};
  this.expires = {};
  this.timer = pruneStore(this, options.interval || 5000);
  this.keyLength = options.keyLength || 32;
}

util.inherits(MemoryStore, SessionStore);

MemoryStore.prototype.load = function (value) {
  var expiry = this.expires[value];

  if (!expiry || expiry > Date.now()) {
    return this.sessions[value] || {};
  }

  return {};
};

MemoryStore.prototype.save = function (session) {
  var key = session._id;
  if (!key) {
    key = session._id = makeUniqueKey(this);
  }

  this.sessions[key] = session;
  this.touch(session);

  return key;
};

MemoryStore.prototype.touch = function (session) {
  var key = session._id;
  if (this.ttl && key && this.sessions[key]) {
    this.expires[key] = Date.now() + this.ttl;
  }
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

  if (this.timer) {
    clearInterval(this.timer);
    delete this.timer;
  }
};

function makeUniqueKey(store) {
  var key;
  do {
    key = utils.makeKey(store.keyLength);
  } while (store.sessions[key]);

  return key;
}

function pruneStore(store, interval) {
  var timer = setInterval(function () {
    var now = Date.now();

    var expiry;
    for (var key in store.expires) {
      expiry = store.expires[key];
      if (expiry && expiry < now) {
        store.purge(key);
      }
    }
  }, interval);

  // Don't let this timer keep the event loop running.
  timer.unref();

  return timer;
}
