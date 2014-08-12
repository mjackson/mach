var mergeProperties = require('./mergeProperties');
var call = require('../call');

var methods = [
  'DELETE',
  'GET',
  'HEAD',
  'OPTIONS',
  'PATCH',
  'POST',
  'PUT'
];

methods.forEach(function (method) {
  exports[method.toLowerCase()] = function (app, options) {
    return call(app, mergeProperties(options || {}, { method: method }));
  };
});
