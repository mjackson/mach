var CookieStore = require('../CookieStore');
var describeSessionStore = require('./describeSessionStore');

describe('CookieStore', function () {
  describeSessionStore(
    new CookieStore({
      secret: 'secret'
    })
  );
});
