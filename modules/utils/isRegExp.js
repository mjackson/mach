function isRegExp(object) {
  return object != null && Object.prototype.toString.call(object) === '[object RegExp]';
}

module.exports = isRegExp;
