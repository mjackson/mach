module.exports = makeContentType;

/**
 * A middleware that sets a default Content-Type header in case one hasn't
 * already been set in a downstream app.
 */
function makeContentType(app, defaultType) {
  defaultType = defaultType || 'text/html';

  function contentType(request) {
    return request.call(app).then(function (response) {
      var headers = response.headers;
      if (!headers['Content-Type']) headers['Content-Type'] = defaultType;
      return response;
    });
  }

  return contentType;
}
