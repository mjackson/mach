var ORIGIN_MATCHER = /^(https?:)\/\/(?:([^@]+)@)?([^/:]+)(?::(\d+))?/;

function parseURL(url) {
  var origin = ORIGIN_MATCHER.exec(url) || {};

  var anchor = document.createElement('a');
  anchor.href = url;

  return {
    protocol: origin[1] || null,
    auth: origin[2] || null,
    hostname: origin[3] || null,
    port: origin[4] || null,
    pathname: anchor.pathname,
    search: anchor.search,
    hash: anchor.hash
  };
}

module.exports = parseURL;
