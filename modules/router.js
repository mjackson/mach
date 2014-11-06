var d = require('d');
var compileRoute = require('./utils/compileRoute');
var defaultApp = require('./utils/defaultApp');
var isRegExp = require('./utils/isRegExp');
var makeParams = require('./utils/makeParams');
var mergeProperties = require('./utils/mergeProperties');
var RoutingProperties = require('./utils/RoutingProperties');

/**
 * A middleware that provides pattern-based routing for URL's, with optional
 * support for restricting matches to a specific request method. Named segments
 * of the URL are added to request.params and take precedence over all others.
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
 *     // ...
 *   });
 *
 *   app.get('/users/:userID', function (request) {
 *     var userID = request.params.userID;
 *     // ...
 *   });
 *
 *   mach.serve(app);
 *
 * Note: All routes are tried in the order they were defined.
 */
function router(app) {
  app = app || defaultApp;

  var routes = {};

  function callRouter(conn) {
    var method = conn.method;
    var routesToTry = (routes[method] || []).concat(routes.ANY || []);

    var route, match;
    for (var i = 0, len = routesToTry.length; i < len; ++i) {
      route = routesToTry[i];

      // Try to match the route.
      if (match = route.pattern.exec(conn.pathname)) {
        var params = makeParams(route.keys, Array.prototype.slice.call(match, 1));

        if (conn.params) {
          // Route params take precedence above all others.
          mergeProperties(conn.params, params);
        } else {
          conn.params = params;
        }

        return conn.call(route.app);
      }
    }

    return conn.call(app);
  }

  Object.defineProperties(callRouter, {

    /**
     * Sets the given app as the default for this router.
     */
    run: d(function (downstreamApp) {
      app = downstreamApp;
    }),

    /**
     * Adds a new route that runs the given app when the pattern matches the
     * path used in the request. If the pattern is a string, it is automatically
     * compiled. See utils/compileRoute.js.
     */
    route: d(function (pattern, methods, app) {
      if (typeof methods === 'function') {
        app = methods;
        methods = null;
      }

      app = app || defaultApp;

      if (typeof methods === 'string')
        methods = [ methods ];

      if (!Array.isArray(methods))
        methods = [ 'ANY' ];

      var keys = [];

      if (typeof pattern === 'string')
        pattern = compileRoute(pattern, keys);

      if (!isRegExp(pattern))
        throw new Error('Pattern must be a RegExp');

      var route = { pattern: pattern, keys: keys, app: app };

      methods.forEach(function (method) {
        var upperMethod = method.toUpperCase();

        if (routes[upperMethod]) {
          routes[upperMethod].push(route);
        } else {
          routes[upperMethod] = [ route ];
        }
      });
    })

  });

  Object.defineProperties(callRouter, RoutingProperties);

  return callRouter;
}

module.exports = router;
