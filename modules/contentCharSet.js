/**
 * A middleware that sets a default `charset` in the `Content-Type` header, if
 * one hasn't already been set in a downstream app.
 */

function contentCharSet(app, charSet) {
  return function (conn) {
    return conn.call(app).then(function () {
      if (charSet) {
        // The actual header is written at the last possible moment in bindApp
        // so we don't have to worry about being clobbered by someone setting
        // Content-Type after this has already run
        conn.response._partialHeaders['charSet'] = charSet;
      }
    });
  };
}

module.exports = contentCharSet;
