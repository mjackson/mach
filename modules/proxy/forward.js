var isRegExp = require('./utils/isRegExp');
var Proxy = require('./Proxy');

function returnTrue() {
  return true;
}

/**
 * A middleware that forwards requests that pass the given test function
 * to the given app. If the app is a string, it is used to setup a proxy
 * to that URL. Otherwise it may be a hash of options that are passed to
 * the Proxy constructor.
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
function forward(app, targetApp, test) {
  test = test || returnTrue;

  if (isRegExp(test)) {
    var pattern = test;
    test = function (request) {
      return pattern.test(request.url);
    };
  } else if (typeof test !== 'function') {
    throw new Error('mach.forward needs a test function');
  }

  if (typeof targetApp !== 'function')
    targetApp = new Proxy(targetApp);

  return function (request) {
    if (test(request))
      return request.call(targetApp);

    return request.call(app);
  };
}

module.exports = forward;
