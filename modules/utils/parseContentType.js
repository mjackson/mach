/**
 * Parses a Content-Type string including parameters and returns an object
 * containing the mediaType and charset
 *
 *   parseContentType('"application/javascript"; charset=utf-8') =>
 *     { mediaType: 'application/javascript',
 *       charset: 'utf-8' }
 *
 *   parseContentType('application/javascript; charset="utf-8"') =>
 *     { mediaType: 'application/javascript',
 *       charset: 'utf-8' }
 *
 *   parseContentType('application/javascript') =>
 *     { mediaType: 'application/javascript',
 *       charset: '' }
 *
 * http://www.w3.org/Protocols/rfc1341/4_Content-Type.html
 */
var contentTypeRegEx = /^\s*"?([^\s]*\/[^\s]*)"?\s*[;,]\s*charset\s*=\s*"?([^\s]*)"?\s*$/;

function parseContentType(value) {
  if (!value)
    return null;

  var parts = contentTypeRegEx.exec(value);

  if (!parts)
    throw new Error(value + " does not appear to be a valid Content-Type");

  return {
    mediaType: parts[1],
    charset: parts[2]
  };
}

module.exports = parseContentType;
