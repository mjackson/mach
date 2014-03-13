require('./helper');
var RSVP = require('rsvp');
module.exports = describeSessionStore;

function describeSessionStore(store, skip) {
  if (!skip) {
    beforeEach(function () {
      return store.purge();
    });

    after(function () {
      return store.destroy();
    });
  }

  var desc = skip ? describe.skip : describe;

  desc('when there is no session with a given value', function () {
    var session;
    beforeEach(function () {
      return RSVP.resolve(store.load('fake-value')).then(function (newSession) {
        session = newSession;
      });
    });

    it('returns an empty object', function () {
      assert.deepEqual(session, {});
    });
  });

  desc('when a session is saved', function () {
    var value;
    beforeEach(function () {
      var session = { count: 1 };
      return RSVP.resolve(store.save(session)).then(function (newValue) {
        value = newValue;
      });
    });

    it('can be retrieved using the opaque return value', function () {
      return RSVP.resolve(store.load(value)).then(function (session) {
        assert(session);
        assert.equal(session.count, 1);
      });
    });
  });

  desc('when it has a TTL', function () {
    beforeEach(function () {
      store.ttl = 10;
    });

    afterEach(function () {
      delete store.ttl;
    });

    describe('and a session is not expired', function () {
      var value;
      beforeEach(function () {
        var session = { count: 1 };
        return RSVP.resolve(store.save(session)).then(function (newValue) {
          value = newValue;
        });
      });

      it('loads the session', function () {
        return RSVP.resolve(store.load(value)).then(function (session) {
          assert(session);
          assert.equal(session.count, 1);
        });
      });
    });

    describe('and a session is expired', function () {
      var value;
      beforeEach(function () {
        var session = { count: 1 };
        return RSVP.resolve(store.save(session)).then(function (newValue) {
          value = newValue;
          return delay(store.ttl);
        });
      });

      it('loads a new session', function () {
        return RSVP.resolve(store.load(value)).then(function (session) {
          assert(session);
          assert.deepEqual(session, {});
        });
      });
    });

    describe('and a session is touched before it expires', function () {
      var value;
      beforeEach(function () {
        var session = { count: 1 };
        return RSVP.resolve(store.save(session)).then(function () {
          return delay(store.ttl / 2).then(function () {
            return RSVP.resolve(store.touch(session)).then(function () {
              return RSVP.resolve(store.save(session)).then(function (newValue) {
                value = newValue;
                return delay(store.ttl / 2);
              });
            });
          });
        });
      });

      it('loads the session', function () {
        return RSVP.resolve(store.load(value)).then(function (session) {
          assert(session);
          assert.equal(session.count, 1);
        });
      });
    });
  });
}

function delay(ms) {
  var deferred = RSVP.defer();
  setTimeout(deferred.resolve, ms);
  return deferred.promise;
}
