var parseMediaValue = require('./parseMediaValue');

/**
 * Parses a string containing multiple media values and returns an array
 * of objects containing data about each value. Such strings are used as
 * the values of the Accept* family of HTTP headers.
 */
function parseMediaValues(value, typeSeparator) {
  return value.split(/\s*,\s*/).map(function (mediaValue) {
    return parseMediaValue(mediaValue, typeSeparator);
  });
}

module.exports = parseMediaValues;
