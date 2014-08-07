var isNode = require('./isNode');

var sendRequest;
if (isNode()) {
  var moduleID = './sendNodeRequest'; // Stop Browserify.
  sendRequest = require(moduleID);
} else {
  sendRequest = require('./sendXMLHttpRequest');
}

module.exports = sendRequest;
