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
 * - expireAfter      The time after which sessions are considered stale
 * - keyLength        The length that will be used for unique cache keys
 * - interval         The interval (in ms) at which the cache will be purged
 *                    of stale sessions. Defaults to 5000
 */
function MemoryStore(options) {
  SessionStore.call(this);

  options = options || {};

  this.sessions = {};
  this.expires = {};
  this.timer = pruneStore(this, options.interval || 5000);
  this.keyLength = options.keyLength || 32;
  this.ttl = options.expireAfter
    ? (1000 * options.expireAfter) // expireAfter is given in seconds.
    : 0;
}

util.inherits(MemoryStore, SessionStore);

MemoryStore.prototype.load = function (value) {
  var expiry = this.expires[value];

  if (expiry && expiry > Date.now()) {
    return this.sessions[value];
  }

  return {};
};

MemoryStore.prototype.save = function (session) {
  var key = session._id;
  if (!key) {
    key = session._id = makeUniqueKey(this);
  }

  this.sessions[key] = session;
  this.expires[key] = Date.now() + this.ttl;

  return key;
};

MemoryStore.prototype.touch = function (key) {
  if (this.expires[key]) {
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
      if (!expiry || expiry < now) {
        store.purge(key);
      }
    }
  }, interval);

  // Don't let this timer keep the event loop running.
  timer.unref();

  return timer;
}
