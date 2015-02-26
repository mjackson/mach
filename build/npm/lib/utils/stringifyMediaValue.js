"use strict";

/**
 * Creates a string from an object containing a media value. This object may
 * have properties containing the type, subtype, and parameters.
 *
 *   stringifyMediaValue({ type: 'text', subtype: 'html', params: { level: '2', q: '0.4' } }) =>
 *     "text/html;level=2;q=0.4"
 *
 *   stringifyMediaValue({ type: 'en', subtype: 'gb', params: { q: '0.8' } }, "-") =>
 *     "en-gb;q=0.8"
 *
 *   stringifyMediaValue({ type: 'unicode-1-1', params: { q: '0.8' } }) =>
 *     "unicode-1-1;q=0.8"
 */
function stringifyMediaValue(value, typeSeparator) {
  typeSeparator = typeSeparator || "/";

  var string = value.type || "*";

  if (value.subtype) string += typeSeparator + value.subtype;

  if (value.params) {
    var params = value.params;

    for (var paramName in params) {
      if (params.hasOwnProperty(paramName)) {
        string += ";" + paramName;

        if (params[paramName] != null) string += "=" + params[paramName];
      }
    }
  }

  return string;
}

module.exports = stringifyMediaValue;