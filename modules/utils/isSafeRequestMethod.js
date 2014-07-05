var SAFE_REQUEST_METHODS = {
  GET: true,
  HEAD: true,
  OPTIONS: true,
  TRACE: true
};

function isSafeRequestMethod(method) {
  return SAFE_REQUEST_METHODS[method.toUpperCase()] === true;
}

module.exports = isSafeRequestMethod;
