require('./helper');
var describeSessionStore = require('../describeSessionStore');

describe('CookieStore', function () {
  var store = new mach.CookieStore({
    secret: 'secret'
  });

  describeSessionStore(store);
});
