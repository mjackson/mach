var http = require('http');
var https = require('https');
var utils = require('./utils');
var Request = require('./request');
var mach = module.exports;

/**
 * The current version of mach.
 */
mach.version = '0.0.0';

/**
 * The default port to use in mach.serve.
 */
mach.defaultPort = 3333;

/**
 * The timeout to use when gracefully shutting down servers that are started
 * using mach.serve. If a server doesn't close within this time (probably
 * because it has open persistent connections) the process exits.
 */
mach.shutdownTimeout = 30000;

/**
 * Binds the given app to the "request" event of the given server so that it
 * is called whenever the server receives a new request.
 */
mach.bind = bindAppToNodeServer;
function bindAppToNodeServer(app, nodeServer) {
  var address = nodeServer.address();

  if (!address) {
    throw new Error('Cannot bind to server that is not listening');
  }

  var serverName, serverPort;
  if (typeof address === 'string') {
    serverName = address;
    serverPort = 0;
  } else {
    serverName = address.address;
    serverPort = address.port;
  }

  nodeServer.on('request', function (nodeRequest, nodeResponse) {
    var request = makeRequest(nodeRequest, serverName, serverPort);

    request.call(app).then(function (response) {
      var isHead = request.method === 'HEAD';
      var isEmpty = isHead || !utils.statusHasContent(response.status);

      // Preserve the Content-Length header on HEAD requests.
      if (isEmpty && !isHead) {
        response.headers['Content-Length'] = 0;
      }

      nodeResponse.writeHead(response.status, response.headers);

      var content = response.content;

      if (isEmpty) {
        nodeResponse.end();
        if (typeof content.destroy === 'function') {
          content.destroy();
        }
      } else {
        content.pipe(nodeResponse);
      }
    }, function (error) {
      request.error.write((error.stack || error) + '\n');
      nodeResponse.writeHead(500, { 'Content-Type': 'text/plain' });
      nodeResponse.end('Internal Server Error');
    });
  });
}

function makeRequest(nodeRequest, serverName, serverPort) {
  var url = utils.parseUrl(nodeRequest.url);

  return new Request({
    protocolVersion: nodeRequest.httpVersion,
    method: nodeRequest.method,
    remoteHost: nodeRequest.connection.remoteAddress,
    remotePort: nodeRequest.connection.remotePort,
    serverName: process.env.SERVER_NAME || serverName,
    serverPort: serverPort,
    pathInfo: url.pathname,
    queryString: url.query || '',
    headers: nodeRequest.headers,
    content: nodeRequest
  });
}

/**
 * Creates and starts a node HTTP server that serves the given app. Options may
 * be any of the following:
 *
 *   - host     The host name to accept connections on (defaults to INADDR_ANY)
 *   - port     The port to listen on (defaults to mach.defaultPort)
 *   - socket   Unix socket file to listen on (trumps host/port)
 *   - quiet    Set true to prevent the server from writing startup/shutdown
 *              messages to the console
 *   - key      Private key to use for SSL (HTTPS only)
 *   - cert     Public X509 certificate to use (HTTPS only)
 *
 * Returns the newly created HTTP server instance.
 */
mach.serve = serveApp;
function serveApp(app, options) {
  options = options || {};

  if (typeof options === 'number') {
    options = { port: options };
  } else if (typeof options === 'string') {
    options = { socket: options };
  }

  var nodeServer;
  if (options.key && options.cert) {
    nodeServer = https.createServer({ key: options.key, cert: options.cert });
  } else {
    nodeServer = http.createServer();
  }

  function shutdown() {
    process.removeListener('SIGINT', shutdown);
    process.removeListener('SIGTERM', shutdown);

    if (!options.quiet) console.log('>> Shutting down...');

    var timer = setTimeout(function () {
      if (!options.quiet) console.log('>> Exiting');
      process.exit(1);
    }, mach.shutdownTimeout);

    nodeServer.close(function () {
      clearTimeout(timer);
    });
  }

  nodeServer.on('listening', function () {
    mach.bind(app, nodeServer);

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    if (!options.quiet) {
      var address = nodeServer.address();
      var message = '>> mach web server version ' + mach.version + ' started on node ' + process.versions.node + '\n';

      if (typeof address === 'string') {
        message += '>> Listening on ' + address;
      } else {
        message += '>> Listening on ' + address.address;
        if (address.port) message += ':' + address.port;
      }

      message += ', use CTRL+C to stop';

      console.log(message);
    }
  });

  if (options.socket) {
    nodeServer.listen(options.socket);
  } else {
    nodeServer.listen(options.port || mach.defaultPort, options.host);
  }

  return nodeServer;
}

// Expose modules.
var modulePaths = {
  basicAuth:      './basic-auth',
  catch:          './catch',
  commonLogger:   './common-logger',
  contentType:    './content-type',
  errors:         './errors',
  favicon:        './favicon',
  file:           './file',
  gzip:           './gzip',
  mapper:         './mapper',
  methodOverride: './method-override',
  multipart:      './multipart',
  Request:        './request',
  requestParams:  './request-params',
  router:         './router',
  sessionCookie:  './session-cookie',
  stack:          './stack',
  urlMap:         './url-map',
  utils:          './utils'
};

for (var name in modulePaths) {
  (function (path) {
    mach.__defineGetter__(name, function () {
      return require(path);
    });
  })(modulePaths[name]);
}
