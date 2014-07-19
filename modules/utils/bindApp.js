var parseURL = require('./parseURL');
var stringifyError = require('./stringifyError');
var Request = require('../Request');

/**
 * HTTP status codes that don't have entities.
 */
var STATUS_WITHOUT_CONTENT = {
  100: true,
  101: true,
  204: true,
  304: true
};

/**
 * Binds the given app to the "request" event of the given node HTTP server
 * so that it is called whenever the server receives a new request.
 *
 * Returns the request handler function.
 */
function bindApp(app, nodeServer, createRequest) {
  createRequest = createRequest || Request;

  var address = nodeServer.address();

  if (!address)
    throw new Error('Cannot bind to server that is not listening');

  var serverName, serverPort;
  if (typeof address === 'string') {
    serverName = address;
    serverPort = 0;
  } else {
    serverName = address.address;
    serverPort = address.port;
  }

  // Allow setting serverName via the SERVER_NAME environment variable.
  if (process.env.SERVER_NAME)
    serverName = process.env.SERVER_NAME;

  function requestHandler(nodeRequest, nodeResponse) {
    var url = parseURL(nodeRequest.url);
    var request = createRequest({
      protocolVersion: nodeRequest.httpVersion,
      method: nodeRequest.method,
      remoteHost: nodeRequest.connection.remoteAddress,
      remotePort: nodeRequest.connection.remotePort,
      serverName: serverName,
      serverPort: serverPort,
      pathInfo: url.pathname,
      queryString: url.query,
      headers: nodeRequest.headers,
      content: nodeRequest
    });

    nodeRequest.on('close', function () {
      request.onClose();
    });

    request.call(app).then(function (response) {
      var isHead = request.method === 'HEAD';
      var isEmpty = isHead || STATUS_WITHOUT_CONTENT[response.status] === true;

      var headers = response.headers;

      if (isEmpty && !isHead)
        headers['Content-Length'] = 0;

      if (!headers['Date'])
        headers['Date'] = (new Date).toUTCString();

      nodeResponse.writeHead(response.status, headers);

      if (isEmpty) {
        nodeResponse.end();
      } else {
        var content = response.content;
        content.pipe(nodeResponse);
        content.resume();
      }
    }, function (error) {
      request.onError(stringifyError(error));
      nodeResponse.writeHead(500, { 'Content-Type': 'text/plain' });
      nodeResponse.end('Internal Server Error');
    });
  }

  nodeServer.on('request', requestHandler);

  return requestHandler;
}

module.exports = bindApp;
