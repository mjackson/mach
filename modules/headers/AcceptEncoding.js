var parseMediaValue = require('../utils/parseMediaValue');
var parseMediaValues = require('../utils/parseMediaValues');
var qualityFactorForMediaValue = require('../utils/qualityFactorForMediaValue');
var stringifyMediaValues = require('../utils/stringifyMediaValues');

/**
 * Represents an HTTP Accept-Encoding header and provides several methods
 * for determining acceptable content encodings.
 *
 * http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.3
 */
function AcceptEncoding(headerValue) {
  this._mediaValues = headerValue ? parseMediaValues(headerValue) : [];
}

AcceptEncoding.prototype.toString = function () {
  return 'Accept-Encoding: ' + this.value;
};

/**
 * Returns the value of this header as a string.
 */
AcceptEncoding.prototype.__defineGetter__('value', function () {
  return stringifyMediaValues(this._mediaValues) || '';
});

/**
 * Returns true if the given encoding is acceptable.
 */
AcceptEncoding.prototype.accepts = function (encoding) {
  return this.qualityFactorForEncoding(encoding) !== 0;
};

/**
 * Returns the quality factor for the given encoding.
 */
AcceptEncoding.prototype.qualityFactorForEncoding = function (encoding) {
  var values = this._mediaValues;

  var givenValue = parseMediaValue(encoding);
  var matchingValues = values.filter(function (value) {
    if (value.type === '*')
      return true;

    return value.type === givenValue.type;
  }).sort(byHighestPrecedence);

  // From RFC 2616:
  // The "identity" content-coding is always acceptable, unless
  // specifically refused because the Accept-Encoding field includes
  // "identity;q=0", or because the field includes "*;q=0" and does
  // not explicitly include the "identity" content-coding. If the
  // Accept-Encoding field-value is empty, then only the "identity"
  // encoding is acceptable.
  if (givenValue.type === 'identity') {
    if (matchingValues.length && matchingValues[0].type === 'identity')
      return qualityFactorForMediaValue(matchingValues[0]);

    return 1;
  }

  if (!matchingValues.length)
    return 0;

  return qualityFactorForMediaValue(matchingValues[0]);
};

function byHighestPrecedence(a, b) {
  // "*" gets least precedence, all others are equal
  return a === '*' ? -1 : (b === '*' ? 1 : 0);
}

module.exports = AcceptEncoding;
