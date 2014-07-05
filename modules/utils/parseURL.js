var url = require('url');

function parseURL(string) {
  return url.parse(string);
}

module.exports = parseURL;
