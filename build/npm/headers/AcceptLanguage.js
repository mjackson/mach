"use strict";

var d = require("describe-property");
var parseMediaValue = require("../utils/parseMediaValue");
var parseMediaValues = require("../utils/parseMediaValues");
var qualityFactorForMediaValue = require("../utils/qualityFactorForMediaValue");
var stringifyMediaValues = require("../utils/stringifyMediaValues");
var stringifyMediaValueWithoutQualityFactor = require("../utils/stringifyMediaValueWithoutQualityFactor");
var Header = require("../Header");

function byHighestPrecedence(a, b) {
  // "*" gets least precedence, all others are compared by specificity
  return a === "*" ? -1 : b === "*" ? 1 : byMostSpecific(a, b);
}

function byMostSpecific(a, b) {
  return stringifyMediaValueWithoutQualityFactor(b).length - stringifyMediaValueWithoutQualityFactor(a).length;
}

/**
 * Represents an HTTP Accept-Language header and provides several methods
 * for determining acceptable content languages.
 *
 * http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.4
 */
function AcceptLanguage(value) {
  Header.call(this, "Accept-Language", value);
}

AcceptLanguage.prototype = Object.create(Header.prototype, {

  constructor: d(AcceptLanguage),

  /**
   * Returns the value of this header as a string.
   */
  value: d.gs(function () {
    return stringifyMediaValues(this._mediaValues, "-") || "";
  }, function (value) {
    this._mediaValues = value ? parseMediaValues(value, "-") : [];
  }),

  /**
   * Returns true if the given language is acceptable.
   */
  accepts: d(function (language) {
    return this.qualityFactorForLanguage(language) !== 0;
  }),

  /**
   * Returns the quality factor for the given language.
   */
  qualityFactorForLanguage: d(function (language) {
    var values = this._mediaValues;

    if (!values.length) return 1;

    var givenValue = parseMediaValue(language, "-");
    var matchingValues = values.filter(function (value) {
      if (value.type === "*") return true;

      if (value.subtype && value.subtype !== givenValue.subtype) return false;

      return value.type === givenValue.type;
    }).sort(byHighestPrecedence);

    if (!matchingValues.length) return 0;

    return qualityFactorForMediaValue(matchingValues[0]);
  })

});

module.exports = AcceptLanguage;