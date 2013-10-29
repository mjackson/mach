var utils = require('./utils');
module.exports = makeRouter;

/**
 * A middleware that provides pattern-based routing for URL's, with optional
 * support for restricting matches to a specific request method. Passes segments
 * of the URL that were matched as additional arguments to the given app.
 *
 *   var app = mach.router();
 *
 *   app.get('/', function (request) {
 *     return 'Welcome home!';
 *   });
 *
 *   app.get('/login', function (request) {
 *     return 'Please login.';
 *   });
 *
 *   app.post('/login', function (request) {
 *     // login logic goes here...
 *   });
 *
 *   app.get('/users/:user_id', function (request, userId) {
 *     // find the user with the given id...
 *   });
 *
 *   mach.serve(app);
 *
 * Note: All routes are tried in the order they were defined.
 */
function makeRouter(defaultApp) {
  defaultApp = defaultApp || utils.defaultApp;

  var routes = {};

  function router(request) {
    var method = request.method;
    var routesToTry = (routes[method] || []).concat(routes.ANY || []);

    var route, match;
    for (var i = 0, len = routesToTry.length; i < len; ++i) {
      route = routesToTry[i];

      // Try to match the route.
      if (match = route.pattern.exec(request.pathInfo)) {
        return request.apply(route.app, utils.slice(match, 1));
      }
    }

    return request.call(defaultApp);
  }

  /**
   * Sets the given app as the default for this router.
   */
  router.run = function (app) {
    defaultApp = app;
  };

  /**
   * Adds a new route that runs the given app when a given pattern matches the
   * path used in the request. If the pattern is a string, it is automatically
   * compiled (see utils.compileRoute).
   */
  router.route = function (pattern, app, methods) {
    if (typeof methods === 'string') {
      methods = [ methods ];
    } else {
      methods = methods || [ 'ANY' ];
    }

    app = app || utils.defaultApp;

    if (typeof pattern === 'string') {
      pattern = utils.compileRoute(pattern);
    }

    if (!utils.isRegExp(pattern)) {
      throw new Error('Pattern must be a RegExp');
    }

    var route = { pattern: pattern, app: app };

    methods.forEach(function (method) {
      var upperMethod = method.toUpperCase();

      if (routes[upperMethod]) {
        routes[upperMethod].push(route);
      } else {
        routes[upperMethod] = [ route ];
      }
    });
  };

  // Add sugar methods for common HTTP verbs. Note that GET defines
  // routes for both GET *and* HEAD requests.
  var methodVerbs = {
    get: [ 'GET', 'HEAD' ],
    post: 'POST',
    put: 'PUT',
    delete: 'DELETE',
    head: 'HEAD',
    options: 'OPTIONS'
  };

  Object.keys(methodVerbs).forEach(function (method) {
    router[method] = function (pattern, app) {
      return router.route(pattern, app, methodVerbs[method]);
    };
  });

  return router;
}
