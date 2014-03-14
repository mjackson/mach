require('./helper');
var describeSessionStore = require('./describe-session-store');

describe('mach.session.RedisStore', function () {
  var store = new mach.session.RedisStore({
    secret: 'secret'
  });

  describeSessionStore(store, process.env.WITH_REDIS !== '1');
});
