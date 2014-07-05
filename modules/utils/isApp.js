function isApp(object) {
  return object && (typeof object === 'function' || typeof object.apply === 'function');
}

module.exports = isApp;
