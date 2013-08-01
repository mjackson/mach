var errors = require('./errors');
var utils = require('./utils');
module.exports = makeParams;

/**
 * Automatically parses all request parameters and puts them into the `params`
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
function makeParams(app, options) {
  options = options || {};
  var maxLength = options.maxLength;
  var uploadPrefix = options.uploadPrefix;

  function paramsApp(request) {
    if (request.params) {
      return request.call(app); // Don't overwrite existing params.
    }

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

  return paramsApp;
}

function merge(target, source) {
  for (var prop in source) {
    if (source.hasOwnProperty(prop)) {
      target[prop] = source[prop];
    }
  }
}
