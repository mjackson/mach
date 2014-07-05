var stringifyMediaValue = require('./stringifyMediaValue');

/**
 * Creates a string from an object containing a media value, ignoring any
 * "q" value parameters. See exports.stringifyMediaValue.
 */
function stringifyMediaValueWithoutQualityFactor(value, typeSeparator) {
  return stringifyMediaValue({
    type: value.type,
    subtype: value.subtype,
    params: value.params && cloneParamsWithoutQualityFactor(value.params)
  }, typeSeparator);
}

function cloneParamsWithoutQualityFactor(params) {
  var clone = {};

  for (var paramName in params) {
    if (params.hasOwnProperty(paramName) && paramName !== 'q')
      clone[paramName] = params[paramName]; 
  }

  return clone;
}

module.exports = stringifyMediaValueWithoutQualityFactor;
