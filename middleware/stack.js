var d = require('describe-property');
var RoutingProperties = require('../utils/RoutingProperties');
var createMapper = require('./mapper');
var createRouter = require('./router');

function mapperCreator(mappings) {
  return function (app) {
    app = createMapper(app);

    for (var i = 0, len = mappings.length; i < len; ++i)
      app.map.apply(app, mappings[i]);

    return app;
  };
}

function routerCreator(routes) {
  return function (app) {
    app = createRouter(app);

    for (var i = 0, len = routes.length; i < len; ++i)
      app.route.apply(app, routes[i]);

    return app;
  };
}

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
 *   app.map('/images', mach.file('/public/img'));
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
function createStack(app) {
  var layers = [], mappings = [], routes = [];
  var compiledApp;

  function compile(app) {
    if (routes.length)
      app = routerCreator(routes)(app);

    if (mappings.length)
      app = mapperCreator(mappings)(app);

    var index = layers.length;

    while (index)
      app = layers[--index].call(this, app);

    return app;
  }

  function stack(conn) {
    return conn.call(compiledApp || (compiledApp = compile(app)));
  }

  Object.defineProperties(stack, {

    /**
     * Declares that the given `middleware` should be used at the current point
     * in the stack. Any additional arguments to this function are passed along
     * to the middleware with the downstream app as the first argument when the
     * stack is compiled.
     */
    use: d(function (middleware) {
      var args = Array.prototype.slice.call(arguments, 1);

      if (mappings.length)
        layers.push(mapperCreator(mappings.splice(0, mappings.length)));

      if (routes.length)
        layers.push(routerCreator(routes.splice(0, routes.length)));

      layers.push(function (app) {
        return middleware.apply(this, [ app ].concat(args));
      });

      compiledApp = null;
    }),

    /**
     * Uses a mapper to map a URL path to an app.
     */
    map: d(function (location, app) {
      mappings.push([ location, app ]);
      compiledApp = null;
    }),

    /**
     * Uses a router to route URLs that match a pattern/method to an app.
     */
    route: d(function (pattern, methods, app) {
      routes.push([ pattern, methods, app ]);
      compiledApp = null;
    }),

    /**
     * Sets the given app as the default for this stack.
     */
    run: d(function (downstreamApp) {
      app = downstreamApp;
      compiledApp = null;
    })

  });

  Object.defineProperties(stack, RoutingProperties);

  return stack;
}

module.exports = createStack;
