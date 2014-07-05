var makeCookie = require('./makeCookie');

/**
 * Sets a cookie with the given name and options in the given headers hash.
 */
function setCookie(headers, name, options) {
  var cookie = makeCookie(name, options);

  if (headers['Set-Cookie']) {
    headers['Set-Cookie'] = [ headers['Set-Cookie'], cookie ].join('\n');
  } else {
    headers['Set-Cookie'] = cookie;
  }
}

module.exports = setCookie;
