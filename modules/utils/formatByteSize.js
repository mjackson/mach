var SUFFIXES = [ 'B', 'K', 'M', 'G', 'T' ];

function formatByteSize(size) {
  var tier = size > 0 ? Math.floor(Math.log(size) / Math.log(1024)) : 0;
  var n = size / Math.pow(1024, tier);

  if (tier > 0)
    n = Math.floor(n * 10) / 10; // Preserve only 1 digit after decimal.

  return String(n) + SUFFIXES[tier];
}

module.exports = formatByteSize;
