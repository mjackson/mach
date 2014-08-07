function getURLProperties(object) {
  return {
    protocol: object.protocol,
    slashes: true,
    auth: object.username || object.password ? (object.username + ':' + object.password) : '',
    host: object.host,
    port: object.port,
    hostname: object.hostname,
    hash: object.hash,
    search: object.search,
    query: object.search.substring(1),
    pathname: object.pathname,
    path: object.pathname + object.search,
    href: object.href
  }; 
}

var URL;

function parseURLNatively(url) {
  return getURLProperties(new URL(url));
}

function parseURLUsingDOM(url) {
  var a = document.createElement('a');
  a.href = url;
  return getURLProperties(a);
}

var parseURL;
if (typeof window !== 'undefined') {
  URL = window.URL || window.webkitURL;

  if (typeof URL === 'function') {
    parseURL = parseURLNatively;
  } else {
    parseURL = parseURLUsingDOM;
  }
} else {
  var moduleID = 'url'; // Stop Browserify.
  parseURL = require(moduleID).parse;
}

module.exports = parseURL;
