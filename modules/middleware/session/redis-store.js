var util = require('util');
var redis = require('then-redis');
var utils = require('../../utils');
var SessionStore = require('./store');
module.exports = RedisStore;

/**
 * Server-side storage for sessions using Redis.
 *
 * Note: This store always checks for availability of keys in Redis before
 * using them, so it should be safe to use alongside other programs that are
 * using the same database. However, if you purge the store of all keys it will
 * issue a FLUSHDB command to the database, so be careful. This operation never
 * happens automatically.
 *
 * Accepts the following options:
 *
 * - url              The URL of the Redis instance
 * - expireAfter      The time (in seconds) after which sessions expire.
 *                    Defaults to 0 (no expiration)
 * - keyLength        The length that will be used for unique cache keys.
 *                    Defaults to 32
 */
function RedisStore(options) {
  options = options || {};

  SessionStore.call(this, options);

  this.redis = redis.createClient(options.url);
  this.keyLength = options.keyLength || 32;
}

util.inherits(RedisStore, SessionStore);

RedisStore.prototype.load = function (value) {
  return this.redis.get(value).then(function (json) {
    if (!json) return {};
    return JSON.parse(json);
  });
};

RedisStore.prototype.save = function (session) {
  var key = session._id;
  if (!key) {
    var self = this;
    return makeUniqueKey(this).then(function (uniqueKey) {
      session._id = uniqueKey;
      return self.save(session);
    });
  }

  var json = JSON.stringify(session);

  var promise;
  if (this.ttl) {
    promise = this.redis.psetex(key, this.ttl, json);
  } else {
    promise = this.redis.set(key, json);
  }

  return promise.then(function () {
    return key;
  });
};

RedisStore.prototype.touch = function (session) {
  if (this.ttl && session._id) {
    return this.redis.pexpire(session._id, this.ttl);
  }
};

RedisStore.prototype.purge = function (key) {
  if (key) return this.redis.del(key);
  return this.redis.flushdb();
};

RedisStore.prototype.destroy = function () {
  return this.redis.quit();
};

function makeUniqueKey(store) {
  var key = utils.makeKey(store.keyLength);

  // Try to set an empty string to reserve the key.
  return store.redis.setnx(key, '').then(function (result) {
    if (result === 1) return key; // The key was available.
    return makeUniqueKey(store); // Try again.
  });
}
