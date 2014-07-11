/**
 * A middleware that automatically performs content-based HTTP caching in
 * response to requests that use the If-None-Match and/or If-Modified-Since
 * headers. In order to work effectively, downstream apps must use the ETag
 * and/or Last-Modified headers.
 */
function modified(app) {
  return function (request) {
    var checkEtag;
    var ifNoneMatch = request.headers['If-None-Match'];
    if (ifNoneMatch)
      checkEtag = stripQuotes(ifNoneMatch);

    var checkLastModified;
    var ifModifiedSince = request.headers['If-Modified-Since'];
    if (ifModifiedSince)
      checkLastModified = Date.parse(ifModifiedSince);

    return request.call(app).then(function (response) {
      if (checkEtag) {
        var etag = response.headers['ETag'];

        if (etag && etag === checkEtag)
          return notModifiedResponse(response);
      }

      if (checkLastModified) {
        var lastModified = response.headers['Last-Modified'];

        if (lastModified) {
          if (typeof lastModified === 'string')
            lastModified = Date.parse(lastModified);

          if (lastModified <= checkLastModified)
            return notModifiedResponse(response);
        }
      }

      return response;
    });
  };
}

function notModifiedResponse(response) {
  response.status = 304;
  response.content = '';
  return response;
}

function stripQuotes(string) {
  if (string.substring(0, 1) === '"')
    return string.replace(/^"|"$/g, '');

  return string;
}

module.exports = modified;
