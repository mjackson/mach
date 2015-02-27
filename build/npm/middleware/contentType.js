"use strict";

/**
 * A middleware that sets a default Content-Type header in case one hasn't
 * already been set in a downstream app.
 */
function contentType(app, defaultType) {
  defaultType = defaultType || "text/html";

  return function (conn) {
    return conn.call(app).then(function () {
      var headers = conn.response.headers;

      if (!headers["Content-Type"]) headers["Content-Type"] = defaultType;
    });
  };
}

module.exports = contentType;