module.exports = requestParamsMiddleware;

/**
 * Automatically parses all request parameters and puts them into the `params`
 * property of the request object. Valid options include the following:
 *
 * - maxContentLength   The maximum length (in bytes) of the request body.
 *                      Overrides Request.maxContentLength for this request.
 * - uploadDir          The directory to store temporary uploaded files in.
 *                      Overrides Request.uploadDir for this request.
 * - uploadPrefix       A special prefix to use for temporary uploaded file
 *                      names. Overrides Request.uploadPrefix for this request.
 */
function requestParamsMiddleware(app, options) {
  var maxContentLength, uploadDir, uploadPrefix;
  if (typeof options === 'object') {
    maxContentLength = options.maxContentLength;
    uploadDir = options.uploadDir;
    uploadPrefix = options.uploadPrefix;
  } else if (typeof options === 'number') {
    maxContentLength = options;
  } else if (typeof options === 'string') {
    uploadDir = options;
  }

  function requestParams(request) {
    if (maxContentLength != null) request.maxContentLength = maxContentLength;
    if (uploadDir) request.uploadDir = uploadDir;
    if (uploadPrefix) request.uploadPrefix = uploadPrefix;

    return request.parseContent().then(function (params) {
      request.params = params;
      return request.call(app);
    });
  }

  return requestParams;
}
