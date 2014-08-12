var mach = require('../index');

mach.call = require('./call');

// Add mach.get, mach.post, etc. helpers.
var mergeProperties = require('./utils/mergeProperties');
mergeProperties(mach, require('./utils/requestHelpers'));

module.exports = mach;
