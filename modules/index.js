exports.version = require('./version');
exports.Connection = require('./Connection');
exports.Location = require('./Location');
exports.Message = require('./Message');

// Make client methods available always.
require('./client');

// Make server methods available on the server.
if (typeof window === 'undefined')
  require('./server' + ''); // Stop Browserify.
