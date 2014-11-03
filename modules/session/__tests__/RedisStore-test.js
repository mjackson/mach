var RedisStore = require('../RedisStore');
var describeSessionStore = require('./describeSessionStore');

describe('RedisStore', function () {
  describeSessionStore(
    new RedisStore({
      secret: 'secret'
    }),
    process.env.WITH_REDIS !== '1'
  );
});
