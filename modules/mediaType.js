/**
 * A middleware that sets a default Content-Type header in case one hasn't
 * already been set in a downstream app.
 */
function mediaType(app, defaultType) {
  defaultType = defaultType || 'text/html';

  return function (conn) {
    return conn.call(app).then(function () {
      conn.response.mediaType = defaultType;
    });
  };
}

module.exports = mediaType;
