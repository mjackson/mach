/**
 * Parses a media value string including parameters and returns an object
 * containing the type, subtype, and an object of parameters.
 *
 *   parseMediaValue("text/html;level=2;q=0.4") =>
 *     { type: 'text',
 *       subtype: 'html', 
 *       params: { level: '2', q: '0.4' } }
 *
 *   parseMediaValue("en-gb;q=0.8", "-") =>
 *     { type: 'en',
 *       subtype: 'gb',
 *       params: { q: '0.8' } }
 *
 *   parseMediaValue("unicode-1-1;q=0.8") =>
 *     { type: 'unicode-1-1',
 *       subtype: undefined,
 *       params: { q: '0.8' } }
 */
exports.parseMediaValue = function (value, typeSeparator) {
  typeSeparator = typeSeparator || '/';

  var parts = value.split(/\s*;\s*/);

  var mediaTypes = parts.shift().split(typeSeparator, 2);
  var params = parts.reduce(function (memo, part) {
    var nameValue = part.split('=', 2);
    memo[nameValue[0]] = nameValue[1];
    return memo;
  }, {});

  return {
    type: mediaTypes[0],
    subtype: mediaTypes[1],
    params: params
  };
};

/**
 * Parses a string containing multiple media values and returns an array
 * of objects containing data about each value. Such strings are used as
 * the values of the Accept* family of HTTP headers.
 */
exports.parseMediaValues = function (value, typeSeparator) {
  return value.split(/\s*,\s*/).map(function (mediaValue) {
    return exports.parseMediaValue(mediaValue, typeSeparator);
  });
};

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
exports.stringifyMediaValue = function (value, typeSeparator) {
  typeSeparator = typeSeparator || '/';

  var string = value.type || '*';

  if (value.subtype)
    string += typeSeparator + value.subtype;

  if (value.params) {
    var params = value.params;

    for (var paramName in params) {
      if (params.hasOwnProperty(paramName)) {
        string += ';' + paramName;

        if (params[paramName] != null)
          string += '=' + params[paramName];
      }
    }
  }

  return string;
};

/**
 * Creates a string from objects containing media values. Such a string may
 * be used as the value of the Accept* family of HTTP headers.
 */
exports.stringifyMediaValues = function (values, typeSeparator) {
  return values.map(function (mediaValue) {
    return exports.stringifyMediaValue(mediaValue, typeSeparator);
  }).join(', ');
};

/**
 * Creates a string from an object containing a media value, ignoring any
 * "q" value parameters. See exports.stringifyMediaValue.
 */
exports.stringifyMediaValueWithoutQualityFactor = function (value, typeSeparator) {
  return exports.stringifyMediaValue({
    type: value.type,
    subtype: value.subtype,
    params: value.params && _cloneParamsWithoutQualityFactor(value.params)
  }, typeSeparator);
};

function _cloneParamsWithoutQualityFactor(params) {
  var clone = {};

  for (var paramName in params) {
    if (params.hasOwnProperty(paramName) && paramName !== 'q')
      clone[paramName] = params[paramName]; 
  }

  return clone;
}

/**
 * Returns the quality factor for the given media value object.
 */
exports.qualityFactorForMediaValue = function (value) {
  var qualityFactor = value.params && value.params.q;
  return qualityFactor ? parseFloat(qualityFactor) : 1;
};
