var utils = require('./utils');

module.exports = routerMiddleware;

/**
 * A middleware that provides pattern-based routing for URL's, with optional
 * support for restricting matches to a specific request method. Populates the
 * `route` request variable with an object containing the results of the match
 * for all downstream apps.
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
 *   app.get('/users/:user_id', function (request) {
 *     var userId = request.route.user_id;
 *     // find the user with the given id...
 *   });
 *
 * Note: All routes are tried in the order they were defined.
 */
function routerMiddleware(defaultApp) {
  defaultApp = defaultApp || utils.defaultApp;

  var routes = {};

  function router(request) {
    var routesToTry = (routes[request.method] || []).concat(routes.ANY || []);

    var route, match;
    for (var i = 0, len = routesToTry.length; i < len; ++i) {
      route = routesToTry[i];
      match = route.matcher.exec(request.pathInfo);

      if (match) {
        var newRoute = utils.slice(match, 0);

        // Define accessors for named keys.
        route.keys.forEach(function (key, i) {
          Object.defineProperty(newRoute, key, {
            get: function () {
              return this[i + 1];
            },
            set: function (value) {
              this[i + 1] = value;
            }
          });
        });

        // Adjust route for downstream apps.
        var oldRoute = request.route;
        request.route = newRoute;

        return request.call(route.app).then(function (response) {
          // Reset route for upstream apps.
          if (oldRoute) {
            request.route = oldRoute;
          } else {
            delete request.route;
          }

          return response;
        });
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
   * Adds a new route that runs the given app when the given RegExp (the matcher)
   * matches the path used in the request.
   */
  router.route = function (matcher, app, methods) {
    methods = methods || ['ANY'];
    var keys = [];

    if (typeof matcher === 'string') matcher = compileRoute(matcher, keys);
    if (!utils.isRegExp(matcher)) throw new Error('Matcher must be a RegExp');
    if (typeof methods === 'string') methods = [methods];

    methods.forEach(function (method) {
      method = method.toUpperCase();
      if (!routes[method]) routes[method] = [];
      routes[method].push({ matcher: matcher, keys: keys, app: app });
    });
  };

  // Add sugar methods for common HTTP verbs. Note that get defines
  // routes for both GET *and* HEAD requests.
  var methodVerbs = {
    get: ['GET', 'HEAD'],
    post: 'POST',
    put: 'PUT',
    delete: 'DELETE',
    head: 'HEAD',
    options: 'OPTIONS'
  };

  for (var method in methodVerbs) {
    (function (verbs) {
      router[method] = function (matcher, app) {
        return router.route(matcher, app, verbs);
      };
    })(methodVerbs[method]);
  }

  return router;
}

/**
 * Compiles the given route string into a RegExp that can be used to match
 * it. The route may contain named keys in the form of a colon followed by a
 * valid JavaScript identifier (e.g. ":name", ":_name", or ":$name" are all
 * valid keys). If it does, these keys will be added to the given keys array.
 *
 * If the route contains the special "*" symbol, it will automatically create a
 * key named "splat" and will substituted with a "(.*?)" pattern in the
 * resulting RegExp.
 */
routerMiddleware.compileRoute = compileRoute;
function compileRoute(route, keys) {
  var pattern = route.replace(/((:[a-z_$][a-z0-9_$]*)|[*.+()])/ig, function (match) {
    switch (match) {
    case '*':
      keys.push('splat');
      return '(.*?)';
    case '.':
    case '+':
    case '(':
    case ')':
      return utils.escapeRegExp(match);
    }

    keys.push(match.substring(1));

    return '([^./?#]+)';
  });

  return new RegExp('^' + pattern + '$');
}
