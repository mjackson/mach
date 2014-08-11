var isRegExp = require('./utils/isRegExp');
var proxy = require('./proxy');

function returnTrue() {
  return true;
}

/**
 * A middleware that forwards requests that pass the given test function
 * to the given target. If the target is not an app, it should be a string
 * or options hash that is used to create a proxy.
 *
 * Example:
 *
 *   var mach = require('mach/server');
 *   var app = mach.stack();
 *
 *   // Forward all requests to example.com.
 *   app.use(mach.forward, 'http://www.example.com');
 *
 *   // Forward all requests that match "/images/*.jpg" to S3.
 *   app.use(mach.forward, 'http://s3.amazon.com/my-bucket', /\/images/*.jpg/);
 *   
 *   mach.serve(app);
 */
function forward(app, target, test) {
  test = test || returnTrue;

  if (isRegExp(test)) {
    var pattern = test;
    test = function (request) {
      return pattern.test(request.url);
    };
  } else if (typeof test !== 'function') {
    throw new Error('mach.forward needs a test function');
  }

  if (typeof target !== 'function')
    target = proxy(target);

  return function (request) {
    if (test(request))
      return request.call(target);

    return request.call(app);
  };
}

module.exports = forward;
