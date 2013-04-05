var utils = require('./utils');
var matcherMiddleware = require('./matcher');
var mapperMiddleware = require('./mapper');
var stackMiddleware = require('./stack');
module.exports = routerMiddleware;

/**
 * A middleware that provides routing, mapping, and a middleware stack for
 * convenience when using all of them together.
 */
function routerMiddleware(app) {
  var defaultApp = app || utils.defaultApp;

  var matcher = matcherMiddleware(defaultApp);
  var mapper = mapperMiddleware(matcher);
  var stack = stackMiddleware(mapper);

  // Add mapping.
  stack.map = proxyTo(mapper, 'map');

  // Add routing.
  stack.route = proxyTo(matcher, 'route');
  ['get', 'post', 'put', 'delete', 'head', 'options'].forEach(function (method) {
    stack[method] = proxyTo(matcher, method);
  });

  stack.run = proxyTo(matcher, 'run');

  return stack;
}

function proxyTo(object, method) {
  var fn = object[method];
  return function () {
    return fn.apply(object, arguments);
  };
}
