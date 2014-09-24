var http = require('http');
var https = require('https');
var AbortablePromise = require('./AbortablePromise');
var Response = require('../Response');

function sendNodeRequest(options) {
  var transport = options.protocol === 'https:' ? https : http;

  return new AbortablePromise(function (resolve, reject, onAbort) {
    var nodeRequest = transport.request(options);

    nodeRequest.on('response', function (nodeResponse) {
      resolve(new Response({
        status: nodeResponse.statusCode,
        headers: nodeResponse.headers,
        content: nodeResponse
      }));
    });

    nodeRequest.on('error', reject);

    onAbort(function () {
      nodeRequest.abort();
      resolve();
    });

    if (options.content) {
      options.content.pipe(nodeRequest);
    } else {
      nodeRequest.end();
    }
  });
}

module.exports = sendNodeRequest;
