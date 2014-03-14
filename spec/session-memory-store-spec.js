require('./helper');
var describeSessionStore = require('./describe-session-store');

describe('mach.session.MemoryStore', function () {
  var store = new mach.session.MemoryStore({
    secret: 'secret'
  });

  describeSessionStore(store);
});
