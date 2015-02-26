"use strict";

/**
 * A map of HTTP header names with irregular case.
 */
module.exports = ["Content-ID", "Content-MD5", "DNT", "ETag", "P3P", "TE", "WWW-Authenticate", "X-ATT-DeviceId", "X-UA-Compatible", "X-WebKit-CSP", "X-XSS-Protection"].reduce(function (map, headerName) {
  map[headerName.toLowerCase()] = headerName;
  return map;
}, {});