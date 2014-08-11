var call = require('../call');
var mergeProperties = require('./mergeProperties');

function callUsingMethod(method) {
  return function (target, options) {
    return call(target, mergeProperties(options || {}, { method: method }));
  };
}

module.exports = callUsingMethod;
