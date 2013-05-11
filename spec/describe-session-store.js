require('./helper');
var when = require('when');
module.exports = describeSessionStore;

function describeSessionStore(store) {
  beforeEach(function () {
    return store.purge();
  });

  after(function () {
    return store.destroy();
  });

  describe('when there is no session with a given value', function () {
    var session;
    beforeEach(function () {
      return when(store.load('fake-value'), function (newSession) {
        session = newSession;
      });
    });

    it('returns an empty object', function () {
      assert.deepEqual(session, {});
    });
  });

  describe('when a session is saved', function () {
    var value;
    beforeEach(function () {
      var session = { count: 1 };
      return when(store.save(session), function (newValue) {
        value = newValue;
      });
    });

    it('can be retrieved using the opaque return value', function () {
      return when(store.load(value), function (session) {
        assert(session);
        assert.equal(session.count, 1);
      });
    });
  });
}
