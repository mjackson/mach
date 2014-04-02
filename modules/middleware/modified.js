/**
 * A middleware that automatically performs content-based HTTP caching in
 * response to requests that use the If-None-Match and/or If-Modified-Since
 * headers. In order to work effectively, downstream apps must use the ETag
 * and/or Last-Modified headers.
 */
module.exports = function (app) {
  return function (request) {
    var checkEtag;
    var ifNoneMatch = request.headers['if-none-match'];
    if (ifNoneMatch)
      checkEtag = _stripQuotes(ifNoneMatch);

    var checkLastModified;
    var ifModifiedSince = request.headers['if-modified-since'];
    if (ifModifiedSince)
      checkLastModified = Date.parse(ifModifiedSince);

    return request.call(app).then(function (response) {
      if (checkEtag) {
        var etag = response.headers['ETag'];

        if (etag && etag === checkEtag)
          return _notModifiedResponse(response);
      }

      if (checkLastModified) {
        var lastModified = response.headers['Last-Modified'];

        if (lastModified) {
          if (typeof lastModified === 'string')
            lastModified = Date.parse(lastModified);

          if (lastModified <= checkLastModified)
            return _notModifiedResponse(response);
        }
      }

      return response;
    });
  };
};

var NO_CONTENT = new Buffer(0);

function _notModifiedResponse(response) {
  response.status = 304;
  response.content = NO_CONTENT;
  return response;
}

function _stripQuotes(string) {
  if (string.substring(0, 1) === '"')
    return string.replace(/^"|"$/g, '');

  return string;
}
