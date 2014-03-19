var utils = require('./utils');
module.exports = AcceptCharset;

/**
 * Represents an HTTP Accept-Charset header and provides several methods
 * for determining acceptable content character sets.
 *
 * http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.2
 */
function AcceptCharset(headerValue) {
  this._mediaValues = headerValue ? utils.parseMediaValues(headerValue) : [];
}

AcceptCharset.prototype.toString = function () {
  return 'Accept-Charset: ' + this.value;
};

/**
 * Returns the value of this header as a string.
 */
AcceptCharset.prototype.__defineGetter__('value', function () {
  return utils.stringifyMediaValues(this._mediaValues) || '';
});

/**
 * Returns true if the given charset is acceptable.
 */
AcceptCharset.prototype.accepts = function (charset) {
  return this.qualityFactorForCharset(charset) !== 0;
};

/**
 * Returns the quality factor for the given charset.
 */
AcceptCharset.prototype.qualityFactorForCharset = function (charset) {
  var values = this._mediaValues;

  var givenValue = utils.parseMediaValue(charset);
  var matchingValues = values.filter(function (value) {
    if (value.type === '*')
      return true;

    return value.type === givenValue.type;
  }).sort(byHighestPrecedence);

  // From RFC 2616:
  // The special value "*", if present in the Accept-Charset field, matches every character
  // set (including ISO-8859-1) which is not mentioned elsewhere in the Accept-Charset field.
  // If no "*" is present in an Accept-Charset field, then all character sets not explicitly
  // mentioned get a quality value of 0, except for ISO-8859-1, which gets a quality value of
  // 1 if not explicitly mentioned.
  if (givenValue.type === 'iso-8859-1') {
    if (matchingValues.length && matchingValues[0].type === 'iso-8859-1')
      return utils.qualityFactorForMediaValue(matchingValues[0]);

    return 1;
  }

  if (!matchingValues.length)
    return 0;

  return utils.qualityFactorForMediaValue(matchingValues[0]);
};

function byHighestPrecedence(a, b) {
  // "*" gets least precedence, all others are equal
  return a === '*' ? -1 : (b === '*' ? 1 : 0);
}
