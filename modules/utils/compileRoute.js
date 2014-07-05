var escapeRegExp = require('./escapeRegExp');

/**
 * Compiles the given route string into a RegExp that can be used to match
 * it. The route may contain named keys in the form of a colon followed by a
 * valid JavaScript identifier (e.g. ":name", ":_name", or ":$name" are all
 * valid keys). If the route contains the special "*" symbol, it is substituted
 * with a "(.*?)" pattern in the resulting RegExp.
 */
function compileRoute(route) {
  var pattern = route.replace(/((:[a-z_$][a-z0-9_$]*)|[*.+()])/ig, function (match) {
    switch (match) {
    case '*':
      return '(.*?)';
    case '.':
    case '+':
    case '(':
    case ')':
      return escapeRegExp(match);
    }

    return '([^./?#]+)';
  });

  return new RegExp('^' + pattern + '$', 'i');
}

module.exports = compileRoute;
