var errors = require('./errors');
var utils = require('./utils');
module.exports = makeRequestParams;

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
function makeRequestParams(app, options) {
  options = options || {};
  var maxLength = options.maxLength;
  var uploadPrefix = options.uploadPrefix;

  function requestParams(request) {
    request.params = {};
    merge(request.params, request.query);

    return request.parseContent(maxLength, uploadPrefix).then(function (params) {
      merge(request.params, params);
      return request.call(app);
    }, function (error) {
      if (error instanceof errors.MaxLengthExceededError) {
        return utils.requestEntityTooLarge();
      }

      throw error;
    });
  }

  return requestParams;
}

function merge(target, source) {
  for (var prop in source) {
    if (source.hasOwnProperty(prop)) {
      target[prop] = source[prop];
    }
  }
}
