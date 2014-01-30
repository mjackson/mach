/**
 * Overrides the method of the request to a value that was given in either
 * a request parameter or a request header. Can be useful when you need to use
 * HTTP methods other than GET and POST with clients that don't support them,
 * like web browsers.
 *
 * For example, you could use the following HTML form:
 *
 *   <form method="POST" action="/">
 *     <input type="hidden" name="_method" value="PUT">
 *   </form>
 *
 * with an app that uses methodOverride:
 *
 *   var app = mach.stack();
 *   app.use(mach.params);
 *   app.use(mach.methodOverride);
 *   app.run(function (request) {
 *     return request.method; // PUT
 *   });
 *
 * Note: When using mach.methodOverride with POST parameters you need to put
 * mach.params in front of it so that the request parameters will be available.
 */
module.exports = function (app, paramName, headerName) {
  headerName = (headerName || 'X-Http-Method-Override').toLowerCase();
  paramName = paramName || '_method';

  return function (request) {
    var method;
    if (request.headers[headerName]) {
      method = request.headers[headerName];
    } else if (!request.params) {
      request.error.write('No request params. Use mach.params in front of mach.methodOverride\n');
    } else if (request.params[paramName]) {
      method = request.params[paramName];

      // If multiple _method parameters were used, use the last one.
      if (Array.isArray(method)) {
        method = method[method.length - 1];
      }
    }

    if (method) {
      request.method = method.toUpperCase();
    }

    return request.call(app);
  };
};
