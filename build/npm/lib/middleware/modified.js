"use strict";

var stripQuotes = require("../utils/stripQuotes");

/**
 * A middleware that automatically performs content-based HTTP caching in
 * response to requests that use the If-None-Match and/or If-Modified-Since
 * headers. In order to work effectively, downstream apps must use the ETag
 * and/or Last-Modified headers.
 *
 * Example:
 *
 *   app.use(mach.modified);
 *
 *   // Send Last-Modified and ETag headers with static files.
 *   app.use(mach.file, {
 *     useLastModified: true, // this is the default
 *     useETag: true
 *   });
 */
function modified(app) {
  return function (conn) {
    return conn.call(app).then(function () {
      var request = conn.request,
          response = conn.response;

      var ifNoneMatch = request.headers["If-None-Match"];
      var etag = response.headers.ETag;

      if (ifNoneMatch && etag && etag === stripQuotes(ifNoneMatch)) {
        conn.status = 304;
        response.content = "";
        return;
      }

      var ifModifiedSince = request.headers["If-Modified-Since"];
      var lastModified = response.headers["Last-Modified"];

      if (ifModifiedSince && lastModified) {
        if (typeof lastModified === "string") lastModified = Date.parse(lastModified);

        if (lastModified <= Date.parse(ifModifiedSince)) {
          conn.status = 304;
          response.content = "";
        }
      }
    });
  };
}

module.exports = modified;