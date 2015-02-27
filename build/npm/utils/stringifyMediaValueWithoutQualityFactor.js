"use strict";

var stringifyMediaValue = require("./stringifyMediaValue");

function cloneParamsWithoutQualityFactor(params) {
  var clone = {};

  for (var paramName in params) if (params.hasOwnProperty(paramName) && paramName !== "q") clone[paramName] = params[paramName];

  return clone;
}

/**
 * Creates a string from an object containing a media value,
 * ignoring any "q" value parameters.
 */
function stringifyMediaValueWithoutQualityFactor(value, typeSeparator) {
  return stringifyMediaValue({
    type: value.type,
    subtype: value.subtype,
    params: value.params && cloneParamsWithoutQualityFactor(value.params)
  }, typeSeparator);
}

module.exports = stringifyMediaValueWithoutQualityFactor;