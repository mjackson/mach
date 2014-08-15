/**
 * Returns true when running on Node.js, false otherwise.
 */
function isNode() {
  return typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]';
}

module.exports = isNode;
