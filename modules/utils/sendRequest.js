module.exports = (typeof window === 'undefined')
  ? require('./sendNodeRequest' + '') // Stop Browserify.
  : require('./sendXMLHttpRequest');
