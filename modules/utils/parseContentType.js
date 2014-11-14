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
var mediaTypeRegEx = /^\s*"?([^\s]*\/[^\s]*)"?\s*$/;
var parameterRegEx = /^\s*([^\s]+)\s*=\s*"?([^\s]*)"?\s*$/;

function parseContentType(value) {
  if (!value)
    return null;

  var result = {};

  var parts = value.split(";");

  result.mediaType = parts.shift();

  console.assert(
    mediaTypeRegEx.exec(result.mediaType),
    result.mediaType + " does not appear to be a valid media type."
  );

  parts.forEach(
    function (parameter) {
      var parameterParts = parameterRegEx.exec(parameter);

      console.assert(
        parameterParts,
        parameter + " does not appear to be a valid Content-Type parameter."
      );

      var key = parameterParts[1];
      var value = parameterParts[2];

      // normalize the parameter keys we recognize
      if (["charset"].indexOf(key.toLowerCase) !== -1)
        key = key.toLowerCase();

      result[key] = value;
    }
  );

  return result;
}

module.exports = parseContentType;
