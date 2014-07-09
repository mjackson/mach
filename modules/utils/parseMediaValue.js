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
function parseMediaValue(value, typeSeparator) {
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
}

module.exports = parseMediaValue;
