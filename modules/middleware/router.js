var utils = require('../utils');
module.exports = Router;

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
function Router(app) {
  if (!(this instanceof Router))
    return new Router(app);

  this._app = app || utils.defaultApp;
  this._routes = {};
}

Router.prototype.apply = function (request) {
  var routes = this._routes;
  var method = request.method;
  var routesToTry = (routes[method] || []).concat(routes.ANY || []);

  var route, match;
  for (var i = 0, len = routesToTry.length; i < len; ++i) {
    route = routesToTry[i];

    // Try to match the route.
    if (match = route.pattern.exec(request.pathInfo))
      return request.apply(route.app, utils.slice(match, 1));
  }

  return request.call(this._app);
};

/**
 * Sets the given app as the default for this router.
 */
Router.prototype.run = function (app) {
  this._app = app;
};

/**
 * Adds a new route that runs the given app when a given pattern matches the
 * path used in the request. If the pattern is a string, it is automatically
 * compiled (see utils.compileRoute).
 */
Router.prototype.route = function (pattern, methods, app) {
  if (typeof methods === 'function') {
    app = methods;
    methods = null;
  }

  app = app || utils.defaultApp;

  if (typeof methods === 'string')
    methods = [ methods ];

  if (!Array.isArray(methods))
    methods = [ 'ANY' ];

  if (typeof pattern === 'string')
    pattern = utils.compileRoute(pattern);

  if (!utils.isRegExp(pattern))
    throw new Error('Pattern must be a RegExp');

  var routes = this._routes;
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
  patch: 'PATCH',
  delete: 'DELETE',
  head: 'HEAD',
  options: 'OPTIONS'
};

Object.keys(methodVerbs).forEach(function (method) {
  Router.prototype[method] = function (pattern, app) {
    return this.route(pattern, methodVerbs[method], app);
  };
});
