var utils = require('./utils');
module.exports = stackMiddleware;

/**
 * A middleware that helps to build apps fronted by a middleware stack by
 * providing a `use` function. This function is used to specify a piece of
 * middleware in the resulting stack, along with any additional arguments that
 * it needs.
 *
 *   var app = mach.stack();
 *
 *   app.use(mach.gzip);
 *   app.use(mach.file, __dirname + '/public');
 *
 *   mach.serve(app);
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

  /**
   * Declares that the given `middleware` should be used at the current point
   * in the stack. Any additional arguments to this function are passed along
   * to the middleware with the downstream app as the first argument.
   */
  stack.use = function (middleware) {
    var args = utils.slice(arguments, 1);
    layers.push(function (app) {
      return middleware.apply(undefined, [ app ].concat(args));
    });
  };

  return stack;
}
