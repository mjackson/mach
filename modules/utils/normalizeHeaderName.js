var irregularHeaderNames = require('./irregularHeaderNames');

/**
 * Normalizes HTTP header names according to RFC 2616.
 */
function normalizeHeaderName(headerName) {
  headerName = headerName.toLowerCase();

  if (headerName in irregularHeaderNames)
    return irregularHeaderNames[headerName];

  return headerName.replace(/(^|-)([a-z])/g, function (match, dash, letter) {
    return dash + letter.toUpperCase();
  });
}

module.exports = normalizeHeaderName;
