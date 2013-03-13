module.exports = methodOverride;

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
 *   app.use(mach.requestParams);
 *   app.use(mach.methodOverride);
 *   app.run(function (request) {
 *     return request.method; // PUT
 *   });
 *
 * Note: When using mach.methodOverride with POST parameters you need to put
 * mach.requestParams in front of it so that the request parameters will be
 * available.
 */
function methodOverride(app, paramName, headerName) {
  headerName = (headerName || 'X-Http-Method-Override').toLowerCase();
  paramName = paramName || '_method';

  return function (request) {
    var method;
    if (request.headers[headerName]) {
      method = request.headers[headerName];
    } else if (!request.params) {
      request.error.write('No request params. Use requestParams in front of methodOverride\n');
    } else if (request.params[paramName]) {
      method = request.params[paramName];
    }

    if (method) request.method = method.toUpperCase();

    return request.call(app);
  };
}
