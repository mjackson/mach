var d = require('d');

var routingMethods = {};
var routingVerbs = {
  delete: 'DELETE',
  get: [ 'GET', 'HEAD' ],
  head: 'HEAD',
  options: 'OPTIONS',
  patch: 'PATCH',
  post: 'POST',
  put: 'PUT'
};

Object.keys(routingVerbs).forEach(function (method) {
  routingMethods[method] = d(function (pattern, app) {
    return this.route(pattern, routingVerbs[method], app);
  });
});

module.exports = routingMethods;
