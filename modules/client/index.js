var mach = require('../index');

mach.call = require('../utils/callApp');
mach.proxy = require('../utils/createProxy');

var mergeProperties = require('../utils/mergeProperties');

[ 'DELETE',
  'GET',
  'HEAD',
  'OPTIONS',
  'POST',
  'PUT',
  'TRACE'
].forEach(function (method) {
  mach[method.toLowerCase()] = function (app, options) {
    return mach.call(app, mergeProperties(options || {}, { method: method }));
  };
});

module.exports = mach;
