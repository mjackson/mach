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
  mach[method.toLowerCase()] = function (app, options, callback) {
    // Don't mutate options argument.
    options = options ? mergeProperties({}, options) : {};
    options.method = method;

    return mach.call(app, options, callback);
  };
});

module.exports = mach;
