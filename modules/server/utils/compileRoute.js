/**
 * Compiles the given route string into a RegExp that can be used to match
 * it. The route may contain named keys in the form of a colon followed by a
 * valid JavaScript identifier (e.g. ":name", ":_name", or ":$name" are all
 * valid keys). If the route contains the special "*" symbol, it is substituted
 * with a "(.*?)" pattern in the resulting RegExp.
 *
 * If the keys array is supplied, it is populated with the names of all keys.
 */
function compileRoute(route, keys) {
  var pattern = route.replace(/:([a-zA-Z_$][a-zA-Z0-9_$]*)|[*.()^$]/g, function (match, key) {
    switch (match) {
    case '*':
      if (keys)
        keys.push('splat');

      return '(.*?)';
    case '.':
    case '(':
    case ')':
    case '^':
    case '$':
      return '\\' + match;
    }

    if (keys)
      keys.push(key);

    return '([^./?#]+)';
  });

  return new RegExp('^' + pattern + '$', 'i');
}

module.exports = compileRoute;
