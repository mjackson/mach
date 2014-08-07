var parseQuery = require('./parseQuery');

function parseCookie(cookie) {
  return parseQuery(cookie, /[;,] */);
}

module.exports = parseCookie;
