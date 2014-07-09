var parseMediaValue = require('../utils/parseMediaValue');
var parseMediaValues = require('../utils/parseMediaValues');
var qualityFactorForMediaValue = require('../utils/qualityFactorForMediaValue');
var stringifyMediaValues = require('../utils/stringifyMediaValues');
var stringifyMediaValueWithoutQualityFactor = require('../utils/stringifyMediaValueWithoutQualityFactor');

/**
 * Represents an HTTP Accept header and provides several methods for
 * determining acceptable media types.
 *
 * http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.1
 */
function Accept(headerValue) {
  this._mediaValues = headerValue ? parseMediaValues(headerValue) : [];
}

/**
 * Returns the value of this header as a string.
 */
Accept.prototype.__defineGetter__('value', function () {
  return stringifyMediaValues(this._mediaValues) || '*/*';
});

/**
 * Returns true if the given media type is acceptable.
 */
Accept.prototype.accepts = function (mediaType) {
  return this.qualityFactorForMediaType(mediaType) !== 0;
};

/**
 * Returns the quality factor for the given media type.
 */
Accept.prototype.qualityFactorForMediaType = function (mediaType) {
  var values = this._mediaValues;

  if (!values.length)
    return 1;

  var givenValue = parseMediaValue(mediaType);
  var matchingValues = values.filter(function (value) {
    return (value.type === '*' || value.type === givenValue.type) &&
           (value.subtype === '*' || value.subtype === givenValue.subtype) &&
           paramsMatchIgnoringQualityFactor(value.params, givenValue.params);
  }).sort(byHighestPrecedence);

  if (!matchingValues.length)
    return 0;

  return qualityFactorForMediaValue(matchingValues[0]);
};

function paramsMatchIgnoringQualityFactor(params, givenParams) {
  for (var paramName in params) {
    if (params.hasOwnProperty(paramName) && paramName !== 'q' && givenParams[paramName] !== params[paramName])
      return false;
  }

  return true;
}

function byHighestPrecedence(a, b) {
  //   Accept: text/*, text/html, text/html;level=1, */*
  // 
  // have the following precedence:
  // 
  //   1) text/html;level=1
  //   2) text/html
  //   3) text/*
  //   4) */*
  return stringifyMediaValueWithoutQualityFactor(b).length - stringifyMediaValueWithoutQualityFactor(a).length;
}

Accept.prototype.toString = function () {
  return 'Accept: ' + this.value;
};

module.exports = Accept;
