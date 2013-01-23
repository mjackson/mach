var utils = require('./utils');
var mapperMiddleware = require('./mapper');

module.exports = stackMiddleware;

/**
 * A middleware that helps to build apps fronted by a middleware stack by
 * providing a `use` function. This function is used to specify a piece of
 * middleware in the resulting stack, along with any additional arguments that
 * it needs.
 *
 * A `map` function is also provided that can be used for location and/or
 * host-based routing in the middle of a stack. The second argument to `map`
 * should be a callback that will be called with a new stack for that path.
 *
 *   var app = mach.stack();
 *
 *   app.use(mach.gzip);
 *   app.use(mach.file, __dirname + '/public');
 *
 *   app.map('/avatars', function (app) {
 *     app.use(mach.file, __dirname + '/public/users/avatars');
 *   });
 *
 * Note: Calls to `use` and `map` are interleaved so that all middleware that
 * is "used" before a call to `map` will run before it but none after.
 */
function stackMiddleware(app) {
  app = app || utils.defaultApp;

  var calls = [];
  var lastCompiled = 0;
  var compiledApp;

  function stack(request) {
    var numCalls = calls.length;

    if (!compiledApp || lastCompiled != numCalls) {
      lastCompiled = numCalls;
      compiledApp = app;
      while (numCalls > 0) {
        compiledApp = calls[--numCalls](compiledApp);
      }
    }

    return request.call(compiledApp);
  }

  /**
   * Specifies that this stack should run the given `newApp` at its root.
   */
  stack.run = function (newApp) {
    app = newApp;
  };

  var mapper;

  /**
   * Declares that the given `middleware` should be used at the current point
   * in the stack. Any additional arguments to this function are passed along
   * to the middleware with the downstream app as the first argument.
   */
  stack.use = function (middleware) {
    var args = utils.slice(arguments, 1);
    calls.push(function (app) {
      mapper = null;
      return middleware.apply(void 0, [app].concat(args));
    });
  };

  /**
   * This is a convenience function for adding a mapper mounted at `path` at the
   * current point in the stack. The given `callback` is called with a new stack.
   */
  stack.map = function (path, callback) {
    calls.push(function (app) {
      var newStack = stackMiddleware();
      if (typeof callback === 'function') callback(newStack);
      mapper = mapper || mapperMiddleware(app);
      mapper.map(path, newStack);
      return mapper;
    });
  };

  return stack;
}
