/**
 * A map of routing methods to their HTTP verbs. Note that GET
 * defines routes for both GET *and* HEAD verbs.
 */
var ROUTING_METHODS = {
  get: [ 'GET', 'HEAD' ],
  post: 'POST',
  put: 'PUT',
  patch: 'PATCH',
  delete: 'DELETE',
  head: 'HEAD',
  options: 'OPTIONS'
};

function addRoutingMethods(object) {
  if (typeof object.route !== 'function')
    throw new Error('Object needs a route method');

  Object.keys(ROUTING_METHODS).forEach(function (method) {
    object[method] = function (pattern, app) {
      return object.route.call(this, pattern, ROUTING_METHODS[method], app);
    };
  });
}

module.exports = addRoutingMethods;
