var sliceArray = require('../utils/sliceArray');
var Mapper = require('./mapper');
var Router = require('./router');

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
 *   app.use(mach.params);
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
function Stack(app) {
  if (!(this instanceof Stack))
    return new Stack(app);

  this._app = app || new Router;
  this._layers = [];
  this._lastCompiled = 0;
}

Stack.prototype.apply = function (request) {
  var app = this._compiledApp;
  var numLayers = this._layers.length;

  // Do we need to recompile?
  if (!app || this._lastCompiled !== numLayers) {
    app = this._compiledApp = this._compile();
    this._lastCompiled = numLayers;
  }

  return request.call(app);
};

Stack.prototype._compile = function () {
  var layers = this._layers;
  var app = this._app;

  var index = layers.length;
  while (index > 0)
    app = layers[--index].call(this, app);

  return app;
};

/**
 * Declares that the given `middleware` should be used at the current point
 * in the stack. Any additional arguments to this function are passed along
 * to the middleware with the downstream app as the first argument when
 * the stack is compiled.
 */
Stack.prototype.use = function (middleware) {
  var middlewareArgs = sliceArray(arguments, 1);

  this._layers.push(function (app) {
    this._mapper = null;
    return middleware.apply(null, [ app ].concat(middlewareArgs));
  });
};

/**
 * Maps the given location to a new stack. The callback will be called with
 * the new stack when the stack is compiled.
 */
Stack.prototype.map = function (location, callback) {
  this._layers.push(function (app) {
    var stack = new Stack;

    if (typeof callback === 'function')
      callback(stack);

    var mapper = this._mapper;
    if (!mapper)
      mapper = this._mapper = new Mapper(app);

    mapper.map(location, stack);

    return mapper;
  });
};

[ 'run', 'route', 'get', 'post', 'put', 'patch', 'delete', 'head', 'options' ].forEach(function (methodName) {
  Stack.prototype[methodName] = function () {
    var app = this._app;
    var method = app[methodName];

    // By default, the downstream app is a mach.router, so this should only
    // ever happen when the user is doing something out of the ordinary.
    if (typeof method !== 'function')
      throw new Error('The downstream application for this stack does not support ' + methodName);

    return method.apply(app, arguments);
  };
});

module.exports = Stack;
