var utils = require('./utils');
module.exports = matcherMiddleware;

/**
 * A middleware that provides pattern-based routing for URL's, with optional
 * support for restricting matches to a specific request method. Populates the
 * `route` request variable with an object containing the results of the match
 * for all downstream apps.
 *
 *   var app = mach.matcher();
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
 *   mach.serve(app);
 *
 * Note: All routes are tried in the order they were defined.
 */
function matcherMiddleware(defaultApp) {
  defaultApp = defaultApp || utils.defaultApp;

  var routes = {};

  function matcher(request) {
    var method = request.method;
    var routesToTry = (routes[method] || []).concat(routes.ANY || []);

    var route, match;
    for (var i = 0, len = routesToTry.length; i < len; ++i) {
      route = routesToTry[i];

      // Try to match the route.
      match = route.pattern.exec(request.pathInfo);
      if (!match) continue;

      // Define accessors for named route segments.
      var routeData = utils.slice(match, 0);
      Object.defineProperties(routeData, route.accessors);

      request.route = routeData;

      return request.call(route.app);
    }

    return request.call(defaultApp);
  }

  /**
   * Sets the given app as the default for this matcher.
   */
  matcher.run = function (app) {
    defaultApp = app;
  };

  /**
   * Adds a new route that runs the given app when a given RegExp matches the
   * path used in the request.
   */
  matcher.route = function (pattern, app, methods) {
    methods = methods || [ 'ANY' ];
    var keys = [];

    if (typeof pattern === 'string') pattern = compilePattern(pattern, keys);
    if (!utils.isRegExp(pattern)) throw new Error('Pattern must be a RegExp');
    if (typeof methods === 'string') methods = [ methods ];

    var route = { pattern: pattern, app: app };

    // Accessors are used for named route segments.
    route.accessors = keys.reduce(function (memo, key, i) {
      memo[key] = {
        get: function () {
          return this[i + 1];
        },
        set: function (value) {
          this[i + 1] = value;
        }
      };

      return memo;
    }, {});

    methods.forEach(function (method) {
      method = method.toUpperCase();
      if (routes[method]) {
        routes[method].push(route);
      } else {
        routes[method] = [ route ];
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

  for (var method in methodVerbs) {
    (function (verbs) {
      matcher[method] = function (matcher, app) {
        return matcher.route(matcher, app, verbs);
      };
    })(methodVerbs[method]);
  }

  return matcher;
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
matcherMiddleware.compilePattern = compilePattern;
function compilePattern(route, keys) {
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
