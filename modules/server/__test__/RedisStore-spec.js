require('./helper');
var describeSessionStore = require('../../__test__/describeSessionStore');

describe('RedisStore', function () {
  var store = new mach.RedisStore({
    secret: 'secret'
  });

  describeSessionStore(store, process.env.WITH_REDIS !== '1');
});
