require('./helper');
var describeSessionStore = require('../../__tests__/describeSessionStore');

describe('MemoryStore', function () {
  var store = new mach.MemoryStore({
    secret: 'secret'
  });

  describeSessionStore(store);
});
