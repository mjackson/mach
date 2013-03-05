module.exports = requestParamsMiddleware;

/**
 * Automatically parses all request parameters and puts them into the `params`
 * property of the request object. Valid options include the following:
 *
 * - uploadPrefix       A special prefix to use for temporary uploaded file names.
 * - maxContentLength   The maximum length (in bytes) of the request body.
 */
function requestParamsMiddleware(app, options) {
  options = options || {};

  var uploadPrefix = options.uploadPrefix;
  var maxContentLength = options.maxContentLength;

  function requestParams(request) {
    if (uploadPrefix) request.uploadPrefix = uploadPrefix;
    if (maxContentLength != null) request.maxContentLength = maxContentLength;

    return request.parseContent().then(function (params) {
      request.params = params;
      return request.call(app);
    });
  }

  return requestParams;
}
