require('./helper');
var describeSessionStore = require('./describe-session-store');

describe('mach.session.CookieStore', function () {
  var store = new mach.session.CookieStore({
    secret: 'secret'
  });

  describeSessionStore(store);
});
