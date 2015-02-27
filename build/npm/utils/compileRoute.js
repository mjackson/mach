"use strict";

var paramMatcher = /:([a-zA-Z_$][a-zA-Z0-9_$]*)|[*.()\[\]\\+|{}^$]/g;

/**
 * Compiles the given route string into a RegExp that can be used to
 * match a URL. The route may contain named parameters in the form of
 * a colon followed by a valid JavaScript identifier (e.g. ":name",
 * ":_name", and ":$name" are all valid parameters). The route may
 * also contain a * to match any character non-greedily, or a ? to
 * match the previous thing 0 or 1 time.
 *
 * The keys array is populated with names of all parameters in the
 * order they appear in the route string.
 */
function compileRoute(route, keys) {
  var source = route.replace(paramMatcher, function (match, key) {
    if (key) {
      keys.push(key);
      return "([^./?#]+)";
    } else if (match === "*") {
      keys.push("splat");
      return "(.*?)";
    } else {
      return "\\" + match;
    }
  });

  return new RegExp("^" + source + "$", "i");
}

module.exports = compileRoute;