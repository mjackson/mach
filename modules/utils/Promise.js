var Promise = require('when/lib/Promise');

// TODO: Only do this in dev.
require('when/monitor')(Promise);

module.exports = Promise;
