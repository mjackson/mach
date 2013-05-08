var utils = require('./utils');
var mapperMiddleware = require('./mapper');
module.exports = stackMiddleware;

/**
 * A middleware that helps to build apps fronted by a middleware stack by
 * providing a `use` function. This function is used to specify a piece of
 * middleware in the resulting stack, along with any additional arguments that
 * it needs.
 *
 * For convenience in building complex apps, a stack also provides host and/or
 * location-based routing using a mach.mapper. However, stack.map takes a
 * callback as the second argument which is a new stack that is used for that
 * location. Calls to stack.use and stack.map are interleaved so that calls to
 * map are only subject to middleware that is placed before them, and not after.
 *
 *   var app = mach.stack();
 *
 *   app.use(mach.gzip);
 *   app.use(mach.file, __dirname + '/public');
 *
 *   // Use a little image server to serve requests that begin
 *   // with /images out of /public/img.
 *   app.map('/images', function (app) {
 *     app.use(mach.file, __dirname + '/public/img');
 *   });
 *
 *   // Since this call is after the image server, parameters won't
 *   // be parsed on requests for images.
 *   app.use(mach.requestParams);
 *
 *   mach.serve(app);
 *
 * Note: A stack is compiled the first time it is called. When a stack is
 * compiled, all middleware is invoked with the downstream app plus any
 * additional arguments that were passed to the call to stack.use. As long as
 * the stack doesn't change between requests, this happens only once.
 */
function stackMiddleware(defaultApp) {
  defaultApp = defaultApp || utils.defaultApp;

  var layers = [];
  var lastCompiled = 0;
  var compiledApp;

  function stack(request) {
    var numLayers = layers.length;

    if (numLayers !== lastCompiled || !compiledApp) {
      lastCompiled = numLayers;
      compiledApp = defaultApp;
      while (numLayers > 0) {
        compiledApp = layers[--numLayers](compiledApp);
      }
    }

    return request.call(compiledApp);
  }

  /**
   * Sets the given app as the default for this stack.
   */
  stack.run = function (app) {
    defaultApp = app;
    compiledApp = null;
  };

  var mapper;

  /**
   * Declares that the given `middleware` should be used at the current point
   * in the stack. Any additional arguments to this function are passed along
   * to the middleware with the downstream app as the first argument when
   * the stack is compiled.
   */
  stack.use = function (middleware) {
    var args = utils.slice(arguments, 1);
    layers.push(function (app) {
      mapper = null;
      return middleware.apply(undefined, [ app ].concat(args));
    });
  };

  /**
   * Maps the given location to a new stack. The callback will be called with
   * the new stack when the stack is compiled.
   */
  stack.map = function (location, callback) {
    layers.push(function (app) {
      var newStack = stackMiddleware();

      if (typeof callback === 'function') {
        callback(newStack);
      }

      mapper = mapper || mapperMiddleware(app);
      mapper.map(location, newStack);

      return mapper;
    });
  };

  return stack;
}
