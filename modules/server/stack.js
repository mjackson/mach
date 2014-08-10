var d = require('d');
var defaultApp = require('./utils/defaultApp');
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
 * Other stacks can be "mounted" easily at various locations using the `map`
 * method. Routes can be added using `route`, `get`, `post`, etc. When a request
 * is received, all middleware, mappings, and routes run in the order they are
 * defined in the stack, top to bottom.
 *
 *   var app = mach.stack();
 *
 *   app.use(mach.gzip);
 *   app.use(mach.file, __dirname + '/public');
 *
 *   // Use an image server to serve requests that begin
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

  this._app = app || defaultApp;
  this._layers = [];
}

Object.defineProperties(Stack.prototype, Router.routingMethods);

Object.defineProperties(Stack.prototype, {

  call: d(function (request) {
    if (!this._compiledApp)
      this._compiledApp = this._compile();

    return request.call(this._compiledApp);
  }),

  _compile: d(function () {
    var layers = this._layers;
    var app = this._app;

    var index = layers.length;
    while (index)
      app = layers[--index].call(this, app);

    return app;
  }),

  /**
   * Declares that the given `middleware` should be used at the current point
   * in the stack. Any additional arguments to this function are passed along
   * to the middleware with the downstream app as the first argument when the
   * stack is compiled.
   */
  use: d(function (middleware) {
    var middlewareArgs = Array.prototype.slice.call(arguments, 1);

    this._layers.push(function (app) {
      return middleware.apply(null, [ app ].concat(middlewareArgs));
    });

    this._compiledApp = null;
  }),

  /**
   * Maps the given location to a new stack. The callback will be called with
   * the new stack when the stack is compiled.
   */
  map: d(function (location, callback) {
    this._layers.push(function (app) {
      var stack = new Stack;

      if (typeof callback === 'function')
        callback(stack);

      if (!(app instanceof Mapper))
        app = new Mapper(app);

      app.map(location, stack);

      return app;
    });

    this._compiledApp = null;
  }),

  /**
   * Uses a Router to add a route that runs when the path used in the request
   * matches the pattern. See Router#route.
   */
  route: d(function (pattern, methods, routeApp) {
    this._layers.push(function (app) {
      if (!(app instanceof Router))
        app = new Router(app);

      app.route(pattern, methods, routeApp);

      return app;
    });

    this._compiledApp = null;
  }),

  /**
   * Sets the given app as the default for this stack.
   */
  run: d(function (app) {
    this._app = app;
    this._compiledApp = null;
  })

});

module.exports = Stack;
