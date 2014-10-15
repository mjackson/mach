require('./helper');
var describeSessionStore = require('../../__test__/describeSessionStore');

describe('MemoryStore', function () {
  var store = new mach.MemoryStore({
    secret: 'secret'
  });

  describeSessionStore(store);
});
