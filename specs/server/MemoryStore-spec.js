require('./helper');
var describeSessionStore = require('../describeSessionStore');

describe('MemoryStore', function () {
  var store = new mach.MemoryStore({
    secret: 'secret'
  });

  describeSessionStore(store);
});
