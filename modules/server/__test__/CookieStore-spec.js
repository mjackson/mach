require('./helper');
var describeSessionStore = require('../../__test__/describeSessionStore');

describe('CookieStore', function () {
  var store = new mach.CookieStore({
    secret: 'secret'
  });

  describeSessionStore(store);
});
