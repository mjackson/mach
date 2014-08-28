var asap = require('asap');
var makePromise = require('when/lib/makePromise');
var Scheduler = require('when/lib/Scheduler');

var Promise = makePromise({
  scheduler: new Scheduler(asap)
});

// TODO: Only do this in dev.
require('when/monitor')(Promise);

module.exports = Promise;
