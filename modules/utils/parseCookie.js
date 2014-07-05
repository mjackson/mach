var querystring = require('querystring');

function parseCookie(cookie) {
  return querystring.parse(cookie, /[;,] */);
}

module.exports = parseCookie;
