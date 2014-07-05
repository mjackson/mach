var stringifyMediaValue = require('./stringifyMediaValue');

/**
 * Creates a string from objects containing media values. Such a string may
 * be used as the value of the Accept* family of HTTP headers.
 */
function stringifyMediaValues(values, typeSeparator) {
  return values.map(function (mediaValue) {
    return stringifyMediaValue(mediaValue, typeSeparator);
  }).join(', ');
}

module.exports = stringifyMediaValues;
