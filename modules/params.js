var MaxLengthExceededError = require('./utils/MaxLengthExceededError');
var mergeProperties = require('./utils/mergeProperties');

/**
 * Automatically parses all request parameters and stores them in the `params`
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
 *
 * If the maximum allowed length is exceeded, this middleware automatically returns
 * a 413 Request Entity Too Large response to the client.
 *
 * Note: This middleware parses all request parameters for all downstream apps. If
 * you'd prefer to only do this work on some requests and not all, you can use
 * request.getParams and/or request.filterParams inside your app instead.
 */
function parseParams(app, options) {
  options = options || {};

  var maxLength = options.maxLength;
  var uploadPrefix = options.uploadPrefix;

  return function (conn) {
    return conn.getParams(maxLength, uploadPrefix).then(function (params) {
      if (conn.params) {
        // Route params take precedence over content params.
        conn.params = mergeProperties(params, conn.params);
      } else {
        conn.params = params;
      }

      return conn.call(app);
    }, function (error) {
      if (error instanceof MaxLengthExceededError)
        return conn.text(413, 'Request Entity Too Large');

      throw error;
    });
  };
}

module.exports = parseParams;
