var mach = require('../index');

mach.call = require('../utils/callApp');
var createProxy = mach.createProxy = require('../utils/createProxy');

var Location = require('../Location');
var mergeProperties = require('../utils/mergeProperties');

[ 'DELETE',
  'GET',
  'HEAD',
  'OPTIONS',
  'POST',
  'PUT',
  'TRACE'
].forEach(function (method) {
  var methodName = method.toLowerCase();

  mach[methodName] = function (app, options, callback) {
    if (typeof app === 'string' || app instanceof Location) {
      app = createProxy(app);
    } else if (typeof app !== 'function') {
      throw new Error('mach.' + methodName + ' needs an app');
    }

    // Don't mutate options argument.
    options = options ? mergeProperties({}, options) : {};
    options.method = method;

    return mach.call(app, options, callback);
  };
});

module.exports = mach;
