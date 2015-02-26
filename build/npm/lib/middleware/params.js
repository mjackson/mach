"use strict";

var objectAssign = require("object-assign");
var mach = require("../index");
var MaxLengthExceededError = require("../utils/MaxLengthExceededError");

mach.extend(require("../extensions/server"));

/**
 * Automatically parses all request parameters and stores them in conn.params.
 * This is the union of all GET (query string) and POST (content) parameters,
 * such that all POST parameters with the same name take precedence.
 *
 * Valid options are:
 *
 * - maxLength          The maximum length (in bytes) of the request content
 *
 * If the maximum allowed length is exceeded, this middleware returns a
 * 413 Request Entity Too Large response.
 *
 * Note: This middleware parses all request parameters for all downstream apps. If
 * you'd prefer to only do this work on some requests and not all, you can use
 * conn.getParams inside your app instead.
 */
function parseParams(app, options) {
  options = options || {};

  if (typeof options === "number") options = { maxLength: options };

  var maxLength = options.maxLength;

  return function (conn) {
    return conn.getParams(maxLength).then(function (params) {
      if (conn.params) {
        // Route params take precedence over content params.
        conn.params = objectAssign(params, conn.params);
      } else {
        conn.params = params;
      }

      return conn.call(app);
    }, function (error) {
      if (error instanceof MaxLengthExceededError) return conn.text(413, "Request Entity Too Large");

      throw error;
    });
  };
}

module.exports = parseParams;