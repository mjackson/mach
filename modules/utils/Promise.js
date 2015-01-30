var Promise = require('when/lib/Promise');

if (process.env.NODE_ENV !== 'production')
  require('when/monitor')(Promise);

module.exports = Promise;
