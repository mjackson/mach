function stripQuotes(string) {
  if (string.substring(0, 1) === '"')
    return string.replace(/^"|"$/g, '');

  return string;
}

module.exports = stripQuotes;
