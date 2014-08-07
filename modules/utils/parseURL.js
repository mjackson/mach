var parseURL;
if (typeof window !== 'undefined') {
  parseURL = require('./parseURLUsingDOM');
} else {
  var moduleID = 'url'; // Stop Browserify.
  parseURL = require(moduleID).parse;
}

module.exports = parseURL;
