var URL = window.URL || window.webkitURL;

function parseURLUsingDOM(url) {
  var object;
  if (typeof URL === 'function') {
    object = new URL(url);
  } else {
    object = document.createElement('a');
    object.href = url;
  }

  return {
    protocol: object.protocol,
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

module.exports = parseURLUsingDOM;
