var qs = require('qs');

function parseQueryString(string) {
  return qs.parse(string);
}

module.exports = parseQueryString;
