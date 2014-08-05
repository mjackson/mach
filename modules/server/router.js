var d = require('d');
var compileRoute = require('./utils/compileRoute');
var defaultApp = require('./utils/defaultApp');
var isRegExp = require('./utils/isRegExp');
var makeParams = require('./utils/makeParams');
var mergeProperties = require('./utils/mergeProperties');

var ROUTING_VERBS = {
  get: [ 'GET', 'HEAD' ],
  post: 'POST',
  put: 'PUT',
  patch: 'PATCH',
  delete: 'DELETE',
  head: 'HEAD',
  options: 'OPTIONS'
};

var ROUTING_METHODS = {};

Object.keys(ROUTING_VERBS).forEach(function (method) {
  ROUTING_METHODS[method] = d(function (pattern, app) {
    return this.route(pattern, ROUTING_VERBS[method], app);
  });
});

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
  *    var userID = request.params.userID;
 *     // ...
 *   });
 *
 *   mach.serve(app);
 *
 * Note: All routes are tried in the order they were defined.
 */
function Router(app) {
  if (!(this instanceof Router))
    return new Router(app);

  this._app = app || defaultApp;
  this._routes = {};
}

Object.defineProperties(Router, {

  /**
   * A map of routing methods including `get`, `post`, etc. that other
   * classes that need routing abilities can mix in.
   *
   *   Object.defineProperties(MyRouter.prototype, Router.routingMethods);
   */
  routingMethods: d(ROUTING_METHODS)

});

Object.defineProperties(Router.prototype, ROUTING_METHODS);

Object.defineProperties(Router.prototype, {

  call: d(function (request) {
    var routes = this._routes;
    var method = request.method;
    var routesToTry = (routes[method] || []).concat(routes.ANY || []);

    var route, match;
    for (var i = 0, len = routesToTry.length; i < len; ++i) {
      route = routesToTry[i];

      // Try to match the route.
      if (match = route.pattern.exec(request.pathInfo)) {
        var params = makeParams(route.keys, Array.prototype.slice.call(match, 1));

        if (request.params) {
          // Route params take precedence above all others.
          mergeProperties(request.params, params);
        } else {
          request.params = params;
        }

        return request.call(route.app);
      }
    }

    return request.call(this._app);
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
    var routes = this._routes;

    methods.forEach(function (method) {
      var upperMethod = method.toUpperCase();

      if (routes[upperMethod]) {
        routes[upperMethod].push(route);
      } else {
        routes[upperMethod] = [ route ];
      }
    });
  }),

  /**
   * Sets the given app as the default for this router.
   */
  run: d(function (app) {
    this._app = app;
  })

});

module.exports = Router;
