var d = require('d');
var redis = require('redis');
var Promise = require('bluebird').Promise;
var makeToken = require('./utils/makeToken');
var parseURL = require('./utils/parseURL');

function sendCommand(client, command, args) {
  args = args || [];

  return new Promise(function (resolve, reject) {
    client.send_command(command, args, function (error, value) {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
}

function makeUniqueKey(client, keyLength) {
  var key = makeToken(keyLength);

  // Try to set an empty string to reserve the key.
  return sendCommand(client, 'setnx', [ key, '' ]).then(function (result) {
    if (result === 1)
      return key; // The key was available.

    return makeUniqueKey(client, keyLength); // Try again.
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
 * - keyLength        The length (in bytes) that will be used for unique
 *                    cache keys. Defaults to 32
 * - expireAfter      The number of seconds after which sessions expire.
 *                    Defaults to 0 (no expiration)
 *
 * Additionally, all options are passed through to `redis.createClient`.
 */
function RedisStore(options) {
  options = options || {};

  var port, host;
  if (typeof options.url === 'string') {
    var parsedURL = parseURL(options.url);
    port = parsedURL.port;
    host = parsedURL.hostname;
  }

  this._client = redis.createClient(port, host, options);
  this._keyLength = options.keyLength || 32;
  this._ttl = options.expireAfter
    ? (1000 * options.expireAfter) // expireAfter is given in seconds
    : 0;
}

Object.defineProperties(RedisStore.prototype, {

  load: d(function (value) {
    return sendCommand(this._client, 'get', [ value ]).then(function (json) {
      return json ? JSON.parse(json) : {};
    });
  }),

  save: d(function (session) {
    var client = this._client;
    var keyLength = this._keyLength;
    var ttl = this._ttl;

    return Promise.resolve(session._id || makeUniqueKey(client, keyLength)).then(function (key) {
      session._id = key;

      var json = JSON.stringify(session);

      var promise;
      if (ttl) {
        promise = sendCommand(client, 'psetex', [ key, ttl, json ]);
      } else {
        promise = sendCommand(client, 'set', [ key, json ]);
      }

      return promise.then(function () {
        return key;
      });
    });
  }),

  purge: d(function (key) {
    if (key)
      return sendCommand(this._client, 'del', [ key ]);

    return sendCommand(this._client, 'flushdb');
  }),

  destroy: d(function () {
    return sendCommand(this._client, 'quit');
  })

});

module.exports = RedisStore;
