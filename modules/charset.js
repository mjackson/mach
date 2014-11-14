/**
 * A middleware that sets a default `charset` in the `Content-Type` header, if
 * one hasn't already been set in a downstream app.
 */

function charset(app, charset) {
  return function (conn) {
    return conn.call(app).then(function () {
      if (charset) {
        conn.response.charset = charset;
      }
    });
  };
}

module.exports = charset;
