var d = require('d');

var RoutingMethods = {
  delete: 'DELETE',
  get: [ 'GET', 'HEAD' ],
  head: 'HEAD',
  options: 'OPTIONS',
  patch: 'PATCH',
  post: 'POST',
  put: 'PUT'
};

var RoutingProperties = Object.keys(RoutingMethods).reduce(function (memo, method) {
  memo[method] = d(function (pattern, app) {
    return this.route(pattern, RoutingMethods[method], app);
  });

  return memo;
}, {});

module.exports = RoutingProperties;
