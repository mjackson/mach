var d = require('d');

var methods = {
  delete: 'DELETE',
  get: [ 'GET', 'HEAD' ],
  head: 'HEAD',
  options: 'OPTIONS',
  patch: 'PATCH',
  post: 'POST',
  put: 'PUT'
};

Object.keys(methods).forEach(function (method) {
  exports[method] = d(function (pattern, app) {
    return this.route(pattern, methods[method], app);
  });
});
