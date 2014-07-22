var IRREGULAR_HEADER_NAMES = [
  'Content-ID',
  'Content-MD5',
  'DNT',
  'ETag',
  'P3P',
  'TE',
  'WWW-Authenticate',
  'X-ATT-DeviceId',
  'X-UA-Compatible',
  'X-WebKit-CSP',
  'X-XSS-Protection'
].reduce(function (map, headerName) {
  map[headerName.toLowerCase()] = headerName;
  return map;
}, {});

/**
 * Normalizes HTTP header names according to RFC 2616.
 */
function normalizeHeaderName(headerName) {
  headerName = headerName.toLowerCase();

  if (headerName in IRREGULAR_HEADER_NAMES)
    return IRREGULAR_HEADER_NAMES[headerName];

  return headerName.replace(/(^|-)([a-z])/g, function (match, dash, letter) {
    return dash + letter.toUpperCase();
  });
}

module.exports = normalizeHeaderName;
