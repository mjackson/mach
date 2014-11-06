var Connection = require('../Connection');

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
function bindApp(app, nodeServer) {
  var address = nodeServer.address();

  if (!address)
    throw new Error('Cannot bind to node server that is not listening');

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
    var conn = new Connection({
      protocol: url.protocol,
      version: nodeRequest.httpVersion,
      method: nodeRequest.method,
      url: nodeRequest.url,
      headers: nodeRequest.headers,
      content: nodeRequest,
      remoteHost: nodeRequest.connection.remoteAddress,
      remotePort: nodeRequest.connection.remotePort,
      serverName: serverName,
      serverPort: serverPort
    });

    nodeRequest.on('close', function () {
      conn.onClose();
    });

    conn.call(app).then(function (response) {
      var isHead = conn.method === 'HEAD';
      var isEmpty = isHead || STATUS_WITHOUT_CONTENT[conn.status] === true;
      var headers = conn.response.headers;
      var content = conn.response.content;

      if (isEmpty && !isHead)
        headers['Content-Length'] = 0;

      if (!headers['Date'])
        headers['Date'] = (new Date).toUTCString();

      nodeResponse.writeHead(conn.status, headers);

      if (isEmpty) {
        nodeResponse.end();

        if (typeof content.destroy === 'function')
          content.destroy();
      } else {
        content.pipe(nodeResponse);
      }
    }, function (error) {
      conn.onError(error);
      nodeResponse.writeHead(500, { 'Content-Type': 'text/plain' });
      nodeResponse.end('Internal Server Error');
    });
  }

  nodeServer.on('request', requestHandler);

  return requestHandler;
}

module.exports = bindApp;
