var http = require('http');
var https = require('https');
var utils = require('./utils');
var Request = require('./request');
var mach = module.exports;

/**
 * The current version of mach.
 */
mach.version = '0.6.0';

/**
 * The default port to use in mach.serve.
 */
mach.defaultPort = 3333;

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

  function requestHandler(nodeRequest, nodeResponse) {
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
  }

  nodeServer.on('request', requestHandler);

  return requestHandler;
}

function makeRequest(nodeRequest, serverName, serverPort) {
  var url = utils.parseUrl(nodeRequest.url);
  var request = new Request({
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

  nodeRequest.on('close', function () {
    request.emit('close');
  });

  return request;
}

/**
 * Creates and starts a node HTTP server that serves the given app. Options may
 * be any of the following:
 *
 *   - host     The host name to accept connections on. Defaults to INADDR_ANY
 *   - port     The port to listen on. Defaults to mach.defaultPort
 *   - socket   Unix socket file to listen on (trumps host/port)
 *   - quiet    Set true to prevent the server from writing startup/shutdown
 *              messages to the console. Defaults to false
 *   - timeout  The timeout to use when gracefully shutting down servers when
 *              SIGINT or SIGTERM are received. If a server doesn't close within
 *              this time (probably because it has open persistent connections)
 *              it is forecefully stopped when the process exits. Defaults to 0,
 *              meaning that servers shut down immediately
 *   - key      Private key to use for SSL (HTTPS only)
 *   - cert     Public X509 certificate to use (HTTPS only)
 *
 * Note: When setting the timeout, be careful not to exceed any hard timeouts
 * specified by your PaaS. For example, on Heroku the dyno manager will not
 * permit a timeout longer than ten seconds.
 * See https://devcenter.heroku.com/articles/dynos#graceful-shutdown-with-sigterm
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
    if (!options.quiet) console.log('>> Shutting down...');

    var timer = setTimeout(function () {
      if (!options.quiet) console.log('>> Exiting');
      process.exit(0);
    }, options.timeout || 0);

    nodeServer.close(function () {
      clearTimeout(timer);
    });
  }

  nodeServer.once('listening', function () {
    mach.bind(app, nodeServer);

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);

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

/**
 * A helper for constructing a mach response object with the given
 * content, status, and headers.
 *
 *   function (request) {
 *     return mach.send('That is not allowed', 403, { 'Content-Type': 'text/plain' });
 *   }
 */
mach.send = sendResponse;
function sendResponse(content, status, headers) {
  return { status: status, headers: headers, content: content };
}

/**
 * A helper for constructing a text response.
 *
 *   function (request) {
 *     return mach.text('That is not allowed', 403);
 *   }
 */
mach.text = sendText;
function sendText(text, status, headers) {
  headers = headers || {};
  headers['Content-Type'] = 'text/plain';
  return mach.send(text, status, headers);
}

/**
 * A helper for constructing an HTML (text/html) response.
 *
 *   function (request) {
 *     return mach.html('<p>Thank You</p>', 202);
 *   }
 */
mach.html = sendHtml;
function sendHtml(html, status, headers) {
  headers = headers || {};
  headers['Content-Type'] = 'text/html';
  return mach.send(html, status, headers);
}

/**
 * A helper for constructing a JSON (application/json) response. You
 * can pass a JSON string directly:
 *
 *   function (request) {
 *     return mach.json('{"some":"json"}', 200);
 *   }
 *
 * or use an object that will be JSON.stringify'd:
 *
 *   function (request) {
 *     return mach.json(myObject);
 *   }
 */
mach.json = sendJson;
function sendJson(json, status, headers) {
  headers = headers || {};
  headers['Content-Type'] = 'application/json';
  return mach.send(typeof json === 'string' ? json : JSON.stringify(json), status, headers);
}

/**
 * A helper for constructing a redirect response. Defaults to using a 302
 * status if one isn't explicitly given.
 *
 *   function (request) {
 *     return mach.redirect('/another-url');
 *   }
 */
mach.redirect = sendRedirect;
function sendRedirect(location, status, headers) {
  headers = headers || {};
  headers['Location'] = location;
  status = status || 302;
  var html = '<p>You are being redirected to <a href="' + location + '">' + location + '</a></p>';
  return mach.html(html, status, headers);
}

/**
 * A helper for constructing a response that redirects the client to the
 * URL they came from (the one listed in the Referer header) or an optional
 * default location.
 *
 *   function (request) {
 *     return mach.back(request, '/default-location');
 *   }
 */
mach.back = sendBack;
function sendBack(request, defaultLocation) {
  return mach.redirect(request.headers.referer || defaultLocation || '/');
}

var submodules = {
  basicAuth:      './basic-auth',
  catch:          './catch',
  contentType:    './content-type',
  errors:         './errors',
  favicon:        './favicon',
  file:           './file',
  gzip:           './gzip',
  logger:         './logger',
  mapper:         './mapper',
  matcher:        './matcher',
  methodOverride: './method-override',
  modified:       './modified',
  multipart:      './multipart',
  params:         './params',
  Request:        './request',
  router:         './router',
  session:        './session',
  stack:          './stack',
  token:          './token',
  urlMap:         './url-map',
  utils:          './utils'
};

Object.keys(submodules).forEach(function (name) {
  module.exports.__defineGetter__(name, function () {
    return require(submodules[name]);
  });
});
