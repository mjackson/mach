// This list taken from http://en.wikipedia.org/wiki/List_of_HTTP_header_fields#Field_names
var HEADER_NAMES = [
  // Request headers.
  'Accept',
  'Accept-Charset',
  'Accept-Encoding',
  'Accept-Language',
  'Accept-Datetime',
  'Authorization',
  'Cache-Control',
  'Connection',
  'Cookie',
  'Content-Length',
  'Content-MD5',
  'Content-Type',
  'Date',
  'Expect',
  'From',
  'Host',
  'If-Match',
  'If-Modified-Since',
  'If-None-Match',
  'If-Range',
  'If-Unmodified-Since',
  'Max-Forwards',
  'Origin',
  'Pragma',
  'Proxy-Authorization',
  'Range',
  'Referer',
  'TE',
  'User-Agent',
  'Upgrade',
  'Via',
  'Warning',
  'X-Requested-With',
  'DNT',
  'X-Forwarded-For',
  'X-Forwarded-Proto',
  'Front-End-Https',
  'X-ATT-DeviceId',
  'X-Wap-Profile',
  'Proxy-Connection',

  // Response headers.
  'Access-Control-Allow-Origin',
  'Accept-Ranges',
  'Age',
  'Allow',
  'Cache-Control',
  'Connection',
  'Content-Encoding',
  'Content-Language',
  // 'Content-Length',
  'Content-Location',
  'Content-MD5',
  'Content-Disposition',
  'Content-Range',
  // 'Content-Type',
  // 'Date',
  'ETag',
  'Expires',
  'Last-Modified',
  'Link',
  'Location',
  'P3P',
  'Pragma',
  'Proxy-Authenticate',
  'Refresh',
  'Retry-After',
  'Server',
  'Set-Cookie',
  'Status',
  'Strict-Transport-Security',
  'Trailer',
  'Transfer-Encoding',
  'Upgrade',
  'Vary',
  // 'Via',
  'Warning',
  'WWW-Authenticate',
  'X-Frame-Options',

  // Common, non-standard response headers.
  'Public-Key-Pins',
  'X-XSS-Protection',
  'Content-Security-Policy',
  'X-Content-Security-Policy',
  'X-WebKit-CSP',
  'X-Content-Type-Options',
  'X-Powered-By',
  'X-UA-Compatible'
];

var HEADER_MAP = HEADER_NAMES.reduce(function (map, headerName) {
  map[headerName.toLowerCase()] = headerName;
  return map;
}, {});

function formatNonStandardHeaderName(headerName) {
  return headerName.toLowerCase().replace(/(^|-)([a-z])/g, function (match, dash, letter) {
    return dash + letter.toUpperCase();
  });
}

/**
 * Normalizes HTTP header names according to RFC 2616.
 */
function normalizeHeaderName(headerName) {
  return HEADER_MAP[headerName.toLowerCase()] || formatNonStandardHeaderName(headerName);
}

module.exports = normalizeHeaderName;
