/**
 * All features are required by default in node.js
 */
require('./accept');
require('./client');
require('./multipart');
require('./fs'); // Must be required after multipart.
require('./proxy');
require('./server');

var mach = require('../index');

// Expose all middleware on mach, e.g. as mach.file.
var middleware = require('../middleware');

for (var property in middleware)
  if (middleware.hasOwnProperty(property))
    mach[property] = middleware[property];

module.exports = mach;
