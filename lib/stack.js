var utils = require('./utils');
var makeMapper = require('./mapper');
var makeRouter = require('./router');
module.exports = makeStack;

/**
 * A middleware that aids in building complex apps that are fronted by other
 * middleware in a "middleware stack". Also provides several other useful methods
 * for request mapping and routing that make this middleware a good choice when
 * working with mach at a high level or when getting started for the first time.
 *
 * Middleware are placed into the stack by calling the `use` method which passes
 * along any additional arguments that it receives directly on to the middleware
 * when the stack is compiled.
 *
 * Other stacks can be created and "mounted" easily at various locations using the
 * `map` method. Calls to `use` and `map` are interleaved so that stacks created using
 * `map` only run after middleware that is placed before them in the stack, and not after.
 *
 * Stacks also have URL-based request routing built in when using a mach.router as the
 * downstream app, which is the default. Any routes that you define run *after* all other
 * middleware in the stack. Also, mapping takes precedence to routing so e.g. if a
 * route matches a mapped location it is ignored.
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
 *   // Since this call is *after* the call to map, this middleware
 *   // will not run when requests begin with "/images".
 *   app.use(mach.requestParams);
 *
 *   app.get('/', function (request) {
 *     return "The params are: " + JSON.stringify(request.params);
 *   });
 *
 *   app.post('/posts/:post_id/messages', function (request) {
 *     // ...
 *   });
 *
 *   mach.serve(app);
 *
 * Note: A stack is compiled the first time it is called. When a stack is
 * compiled, all middleware is invoked with the downstream app plus any
 * additional arguments that were passed to the call to stack.use. As long as
 * the stack doesn't change between requests, this happens only once.
 */
function makeStack(defaultApp) {
  defaultApp = defaultApp || makeRouter();

  var layers = [];
  var lastCompiled = 0;
  var compiledApp;
  var mapper;

  function stack(request) {
    var numLayers = layers.length;

    if (!compiledApp || numLayers !== lastCompiled) {
      lastCompiled = numLayers;
      compiledApp = defaultApp;
      mapper = null;
      while (numLayers > 0) {
        compiledApp = layers[--numLayers](compiledApp);
      }
    }

    return request.call(compiledApp);
  }

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
      var newStack = makeStack();

      if (typeof callback === 'function') {
        callback(newStack);
      }

      if (!mapper) {
        mapper = makeMapper(app);
      }

      mapper.map(location, newStack);

      return mapper;
    });
  };

  [ 'run', 'route', 'get', 'post', 'put', 'delete', 'head', 'options' ].forEach(function (method) {
    stack[method] = function () {
      if (typeof defaultApp[method] !== 'function') {
        // By default, defaultApp is a mach.router, so this should only ever happen
        // when the user is doing something out of the ordinary.
        throw new Error('The default application for this stack does not support ' + method);
      }

      return defaultApp[method].apply(defaultApp, arguments);
    };
  });

  return stack;
}
