var d = require('d');
var Promise = require('bluebird').Promise;
var makeToken = require('./utils/makeToken');

function makeUniqueKey(redisClient, keyLength) {
  var key = makeToken(keyLength);

  // Try to set an empty string to reserve the key.
  return redisClient.setnx(key, '').then(function (result) {
    if (result === 1)
      return key; // The key was available.

    return makeUniqueKey(redisClient, keyLength); // Try again.
  });
}

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
 * - keyLength        The length (in bytes) that will be used for unique cache keys.
 *                    Defaults to 32
 * - expireAfter      The number of seconds after which sessions expire.
 *                    Defaults to 0 (no expiration)
 */
function RedisStore(options) {
  options = options || {};

  try {
    var redis = require('then-redis');
  } catch (error) {
    throw new Error('You must install then-redis');
  }

  this._redisClient = redis.createClient(options.url);
  this._keyLength = options.keyLength || 32;
  this._ttl = options.expireAfter
    ? (1000 * options.expireAfter) // expireAfter is given in seconds
    : 0;
}

Object.defineProperties(RedisStore.prototype, {

  load: d(function (value) {
    var client = this._redisClient;

    return client.get(value).then(function (json) {
      if (!json)
        return {};

      return JSON.parse(json);
    });
  }),

  save: d(function (session) {
    var client = this._redisClient;
    var ttl = this._ttl;

    return Promise.resolve(session._id || makeUniqueKey(this._redisClient, this._keyLength)).then(function (key) {
      session._id = key;

      var json = JSON.stringify(session);

      var promise;
      if (ttl) {
        promise = client.psetex(key, ttl, json);
      } else {
        promise = client.set(key, json);
      }

      return promise.then(function () {
        return key;
      });
    });
  }),

  purge: d(function (key) {
    if (key)
      return this._redisClient.del(key);

    return this._redisClient.flushdb();
  }),

  destroy: d(function () {
    return this._redisClient.quit();
  })

});

module.exports = RedisStore;
