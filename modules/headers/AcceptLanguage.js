var parseMediaValue = require('../utils/parseMediaValue');
var parseMediaValues = require('../utils/parseMediaValues');
var qualityFactorForMediaValue = require('../utils/qualityFactorForMediaValue');
var stringifyMediaValues = require('../utils/stringifyMediaValues');
var stringifyMediaValueWithoutQualityFactor = require('../utils/stringifyMediaValueWithoutQualityFactor');

/**
 * Represents an HTTP Accept-Language header and provides several methods
 * for determining acceptable content languages.
 *
 * http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.4
 */
function AcceptLanguage(headerValue) {
  this._mediaValues = headerValue ? parseMediaValues(headerValue, '-') : [];
}

/**
 * Returns the value of this header as a string.
 */
AcceptLanguage.prototype.__defineGetter__('value', function () {
  return stringifyMediaValues(this._mediaValues, '-') || '';
});

/**
 * Returns true if the given language is acceptable.
 */
AcceptLanguage.prototype.accepts = function (language) {
  return this.qualityFactorForLanguage(language) !== 0;
};

/**
 * Returns the quality factor for the given language.
 */
AcceptLanguage.prototype.qualityFactorForLanguage = function (language) {
  var values = this._mediaValues;

  if (!values.length)
    return 1;

  var givenValue = parseMediaValue(language, '-');
  var matchingValues = values.filter(function (value) {
    if (value.type === '*')
      return true;

    if (value.subtype && value.subtype !== givenValue.subtype)
      return false;

    return value.type === givenValue.type;
  }).sort(byHighestPrecedence);

  if (!matchingValues.length)
    return 0;

  return qualityFactorForMediaValue(matchingValues[0]);
};

function byHighestPrecedence(a, b) {
  // "*" gets least precedence, all others are compared by specificity
  return a === '*' ? -1 : (b === '*' ? 1 : byMostSpecific(a, b));
}

function byMostSpecific(a, b) {
  return stringifyMediaValueWithoutQualityFactor(b).length - stringifyMediaValueWithoutQualityFactor(a).length;
}

AcceptLanguage.prototype.toString = function () {
  return 'Accept-Language: ' + this.value;
};

module.exports = AcceptLanguage;
