module.exports = (typeof window === 'undefined')
  ? require('./proxyRequestUsingNode' + '') // Stop Browserify.
  : require('./proxyRequestUsingDOM');
