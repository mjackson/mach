/**
 * Escapes all special RegExp characters in the given string.
 */
function escapeRegExp(string) {
  return String(string).replace(/([.?*+^$[\]\\(){}-])/g, '\\$1');
}

module.exports = escapeRegExp;
