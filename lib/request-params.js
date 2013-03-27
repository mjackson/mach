module.exports = requestParams;

/**
 * Automatically parses all request parameters and puts them into the params
 * property of the request object. This is the union of all GET (query string)
 * and POST (content) parameters, such that all POST parameters with the same
 * name take precedence. Valid options include the following:
 *
 * - maxLength          The maximum length (in bytes) of the request content.
 *                      Overrides Request.maxContentLength for all requests
 *                      using this middleware.
 * - uploadPrefix       A special prefix to use for temporary files on disk
 *                      that are created from file uploads. Overrides
 *                      Request.defaultUploadPrefix for all requests using
 *                      this middleware.
 */
function requestParams(app, options) {
  options = options || {};
  var maxLength = options.maxLength;
  var uploadPrefix = options.uploadPrefix;

  return function (request) {
    request.params = {};
    merge(request.params, request.query);

    return request.parseContent(maxLength, uploadPrefix).then(function (params) {
      merge(request.params, params);
      return request.call(app);
    });
  };
}

function merge(target, source) {
  for (var prop in source) {
    if (source.hasOwnProperty(prop)) {
      target[prop] = source[prop];
    }
  }
}
