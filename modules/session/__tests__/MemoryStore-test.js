var MemoryStore = require('../MemoryStore');
var describeSessionStore = require('./describeSessionStore');

describe('MemoryStore', function () {
  describeSessionStore(
    new MemoryStore({
      secret: 'secret'
    })
  );
});
