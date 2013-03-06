module.exports = requestParams;

/**
 * Automatically parses all request parameters and puts them into the `params`
 * property of the request object. Valid options include the following:
 *
 * - uploadPrefix       A special prefix to use for temporary uploaded file names.
 * - maxContentLength   The maximum length (in bytes) of the request body.
 */
function requestParams(app, options) {
  options = options || {};
  var uploadPrefix = options.uploadPrefix;
  var maxContentLength = options.maxContentLength;

  return function (request) {
    if (uploadPrefix) request.uploadPrefix = uploadPrefix;
    if (maxContentLength != null) request.maxContentLength = maxContentLength;

    request.params = {};
    merge(request.params, request.query);

    return request.parseContent().then(function (params) {
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
