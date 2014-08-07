var request = require('../request');
var mergeProperties = require('./mergeProperties');

function makeRequestMethod(method) {
  return function (options) {
    return request(mergeProperties(options || {}, { method: method }));
  };
}

module.exports = makeRequestMethod;
