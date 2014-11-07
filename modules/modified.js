var stripQuotes = require('./utils/stripQuotes');

function notModifiedResponse(response) {
  response.status = 304;
  response.content = '';
}

/**
 * A middleware that automatically performs content-based HTTP caching in
 * response to requests that use the If-None-Match and/or If-Modified-Since
 * headers. In order to work effectively, downstream apps must use the ETag
 * and/or Last-Modified headers.
 */
function modified(app) {
  return function (conn) {
    return conn.call(app).then(function () {
      var request = conn.request, response = conn.response;
      var ifNoneMatch = request.headers['If-None-Match'];

      if (ifNoneMatch) {
        var etag = response.headers['ETag'];

        if (etag && etag === stripQuotes(ifNoneMatch))
          return notModifiedResponse(response);
      }

      var ifModifiedSince = request.headers['If-Modified-Since'];
      var lastModified = response.headers['Last-Modified'];

      if (ifModifiedSince && lastModified) {
        if (typeof lastModified === 'string')
          lastModified = Date.parse(lastModified);

        if (lastModified <= Date.parse(ifModifiedSince))
          return notModifiedResponse(response);
      }
    });
  };
}

module.exports = modified;
