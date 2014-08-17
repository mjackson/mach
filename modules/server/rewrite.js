var escapeRegExp = require('./utils/escapeRegExp');
var isRegExp = require('./utils/isRegExp');

/**
 * A middleware that provides URL rewriting behavior similar to Apache's
 * mod_rewrite. The pathInfo of requests that match the given pattern is
 * overwritten with the replacement using a simple String#replace.
 */
function rewrite(app, pattern, replacement) {
  if (typeof pattern === 'string')
    pattern = new RegExp('^' + escapeRegExp(pattern) + '$');

  if (!isRegExp(pattern))
    throw new Error('Rewrite pattern must be a RegExp or String');

  replacement = replacement || '';

  return function (request) {
    var pathInfo = request.pathInfo;

    // Modify the pathInfo if the pattern matches.
    if (pattern.test(pathInfo))
      request.pathInfo = pathInfo.replace(pattern, replacement);

    return request.call(app);
  };
}

module.exports = rewrite;
