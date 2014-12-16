module.exports = (typeof window === 'undefined')
  ? require('./parseURLUsingNode' + '') // Stop Browserify.
  : require('./parseURLUsingDOM');
