require('./helper');
var describeSessionStore = require('../../__tests__/describeSessionStore');

describe('CookieStore', function () {
  var store = new mach.CookieStore({
    secret: 'secret'
  });

  describeSessionStore(store);
});
