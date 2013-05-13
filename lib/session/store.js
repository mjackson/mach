module.exports = SessionStore;

/**
 * The base class for all server-side session stores.
 */
function SessionStore(options) {
  this.ttl = options && options.expireAfter
    ? (1000 * options.expireAfter) // expireAfter is given in seconds.
    : 0;
}

/**
 * Loads the session from the given string value which is the opaque value
 * returned from SessionStore#save for a given session.
 */
SessionStore.prototype.load = function (value) {
  throw new Error('Store subclass must implement load');
};

/**
 * Stores the given session object and returns an opaque string value that can
 * be passed to SessionStore#load to retrieve the session again.
 */
SessionStore.prototype.save = function (session) {
  throw new Error('Store subclass must implement save');
};

/**
 * Updates the "modification" time for the given session to delay its expiration.
 * This is done automatically as part of the request cycle when the session is
 * saved so it should rarely need to be called manually.
 *
 * Note: When a session store does not have a TTL, this is always a no-op.
 */
SessionStore.prototype.touch = function (session) {
  throw new Error('Store subclass must implement touch');
};

/**
 * Deletes the session with the given key from this store. If no key is given,
 * deletes all sessions from this store. In stores that do not use session keys
 * (like mach.session.CookieStore) this is a no-op.
 */
SessionStore.prototype.purge = function (key) {};

/**
 * Cleans up any resources used by the session store.
 */
SessionStore.prototype.destroy = function () {};
