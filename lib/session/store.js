module.exports = SessionStore;

/**
 * The base class for all server-side session stores.
 */
function SessionStore() {}

/**
 * Loads the session from the given string value. This value is the same value
 * that would be returned from SessionStore#save for a given session.
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
 * Updates the modification time for the session with the given key. In stores
 * that do not use session ids (like CookieStore) this is a no-op.
 */
SessionStore.prototype.touch = function (key) {};

/**
 * Deletes the session with the given key from this store. If no key is given,
 * deletes all sessions from this store. In stores that do not use session ids
 * (like CookieStore) this is a no-op.
 */
SessionStore.prototype.purge = function (key) {};

/**
 * Cleans up any resources used by the session store.
 */
SessionStore.prototype.destroy = function () {};
