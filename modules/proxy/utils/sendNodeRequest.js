var http = require('http');
var https = require('https');
var Promise = require('bluebird');
var Response = require('../../Response');

function sendNodeRequest(options) {
  var transport = options.protocol === 'https:' ? https : http;

  return new Promise(function (resolve, reject) {
    var nodeRequest = transport.request(options);

    nodeRequest.on('error', reject);

    nodeRequest.on('response', function (nodeResponse) {
      resolve(new Response({
        status: nodeResponse.statusCode,
        headers: nodeResponse.headers,
        content: nodeResponse
      }));
    });

    if (options.content) {
      options.content.pipe(nodeRequest);
    } else {
      nodeRequest.end();
    }
  });
}

module.exports = sendNodeRequest;
