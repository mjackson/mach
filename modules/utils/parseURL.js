module.exports = (typeof window === 'undefined')
  ? require('url' + '').parse // Stop Browserify.
  : require('./parseURLUsingDOM');
