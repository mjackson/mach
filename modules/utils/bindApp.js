/* jshint -W058 */

var Connection = require('../Connection');
var Location = require('../Location');

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
 * Standard ports for HTTP protocols.
 */
var STANDARD_PORTS = {
  'http:': 80,
  'https:': 443
};

/**
 * Creates a new Location object that is reverse-proxy aware.
 */
function createLocation(nodeRequest, serverName, serverPort) {
  var headers = nodeRequest.headers;

  var protocol;
  if (process.env.HTTPS === 'on') {
    protocol = 'https:';
  } else if (headers['x-forwarded-ssl'] === 'on') {
    protocol = 'https:';
  } else if (headers['x-forwarded-scheme']) {
    protocol = headers['x-forwarded-scheme'];
  } else if (headers['x-forwarded-proto']) {
    protocol = headers['x-forwarded-proto'].split(',')[0];
  } else {
    protocol = nodeRequest.protocol;
  }

  var host;
  if (headers['x-forwarded-host']) {
    var hosts = headers['x-forwarded-host'].split(/,\s?/);
    host = hosts[hosts.length - 1];
  } else {
    host = headers['host'] || (serverName + ':' + serverPort);
  }

  var hostParts = host.split(':', 2);
  var hostname = hostParts[0];
  var port = hostParts[1] || headers['x-forwarded-port'];

  if (port == null) {
    if (headers['x-forwarded-host']) {
      port = STANDARD_PORTS[protocol];
    } else if (headers['x-forwarded-proto']) {
      port = STANDARD_PORTS[headers['x-forwarded-proto'].split(',')[0]];
    } else {
      port = serverPort;
    }
  }

  var path = nodeRequest.url;
  var index = path.indexOf('?');

  var pathname, search;
  if (index !== -1) {
    pathname = path.substring(0, index);
    search = path.substring(index);
  } else {
    pathname = path;
    search = '';
  }

  return new Location({
    protocol: protocol,
    hostname: hostname,
    port: port,
    pathname: pathname,
    search: search
  });
}

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
      version: nodeRequest.httpVersion,
      method: nodeRequest.method,
      location: createLocation(nodeRequest, serverName, serverPort),
      headers: nodeRequest.headers,
      content: nodeRequest,
      remoteHost: nodeRequest.connection.remoteAddress,
      remotePort: nodeRequest.connection.remotePort
    });

    nodeRequest.on('close', function () {
      conn.onClose();
    });

    conn.call(app).then(function (response) {
      var isHead = conn.method === 'HEAD';
      var isEmpty = isHead || STATUS_WITHOUT_CONTENT[conn.status] === true;

      var headers = conn.response.headers;
      var content = conn.response.content;
      var partialHeaders = conn.response._partialHeaders;

      if (isEmpty && !isHead)
        headers['Content-Length'] = 0;

      if (!headers['Date'])
        headers['Date'] = (new Date).toUTCString();

      if (!partialHeaders['charSet'])
        partialHeaders['charSet'] = "utf-8";

      if (headers['Content-Type']) {
        headers['Content-Type'] += "; charset=" + partialHeaders['charSet'];
        delete partialHeaders['charSet'];
      }

      delete conn.response['_partialHeaders'];

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
