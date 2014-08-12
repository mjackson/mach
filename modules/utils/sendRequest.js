var sendRequest;
if (typeof window !== 'undefined') {
  sendRequest = require('./sendXMLHttpRequest');
} else {
  var moduleID = './sendNodeRequest'; // Stop Browserify.
  sendRequest = require(moduleID);
}

module.exports = sendRequest;
