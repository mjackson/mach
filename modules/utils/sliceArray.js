var _slice = Array.prototype.slice;

function sliceArray(object) {
  return _slice.apply(object, _slice.call(arguments, 1));
}

module.exports = sliceArray;
