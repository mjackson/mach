/**
 * The current version of mach.
 */
exports.version = require('../package').version;

/**
 * The default port to use in mach.serve.
 */
exports.defaultPort = 3333;

/**
 * A map of HTTP status codes to their descriptions.
 */
exports.STATUS_CODES = {
  100: 'Continue',
  101: 'Switching Protocols',
  102: 'Processing',                       // RFC 2518, obsoleted by RFC 4918
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  207: 'Multi-Status',                     // RFC 4918
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Moved Temporarily',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Time-out',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Request Entity Too Large',
  414: 'Request-URI Too Large',
  415: 'Unsupported Media Type',
  416: 'Requested Range Not Satisfiable',
  417: 'Expectation Failed',
  418: "I'm a teapot",                     // RFC 2324
  422: 'Unprocessable Entity',             // RFC 4918
  423: 'Locked',                           // RFC 4918
  424: 'Failed Dependency',                // RFC 4918
  425: 'Unordered Collection',             // RFC 4918
  426: 'Upgrade Required',                 // RFC 2817
  428: 'Precondition Required',            // RFC 6585
  429: 'Too Many Requests',                // RFC 6585
  431: 'Request Header Fields Too Large',  // RFC 6585
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',          // RFC 2295
  507: 'Insufficient Storage',             // RFC 4918
  509: 'Bandwidth Limit Exceeded',
  510: 'Not Extended',                     // RFC 2774
  511: 'Network Authentication Required'   // RFC 6585
};

/**
 * HTTP status codes that don't have entities.
 */
exports.STATUS_WITHOUT_CONTENT = {
  100: true,
  101: true,
  204: true,
  304: true
};

var stringifyError = require('./utils/stringifyError');

/**
 * Binds the given app to the "request" event of the given server so that it
 * is called whenever the server receives a new request.
 */
exports.bind = function (app, nodeServer) {
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
    var request = makeRequest(nodeRequest, serverName, serverPort);

    request.call(app).then(function (response) {
      var isHead = request.method === 'HEAD';
      var isEmpty = isHead || exports.STATUS_WITHOUT_CONTENT[response.status] === true;

      var headers = response.headers;

      if (isEmpty && !isHead)
        headers['Content-Length'] = 0;

      if (!headers['Date'])
        headers['Date'] = (new Date).toUTCString();

      nodeResponse.writeHead(response.status, headers);

      var content = response.content;

      if (isEmpty) {
        nodeResponse.end();

        if (typeof content.destroy === 'function')
          content.destroy();
      } else {
        content.pipe(nodeResponse);
      }
    }, function (error) {
      request.error.write(stringifyError(error) + '\n');
      nodeResponse.writeHead(500, { 'Content-Type': 'text/plain' });
      nodeResponse.end('Internal Server Error');
    });
  }

  nodeServer.on('request', requestHandler);

  return requestHandler;
};

var Request = require('./Request');
var parseURL = require('./utils/parseURL');

function makeRequest(nodeRequest, serverName, serverPort) {
  var url = parseURL(nodeRequest.url);
  var request = new Request({
    protocolVersion: nodeRequest.httpVersion,
    method: nodeRequest.method,
    remoteHost: nodeRequest.connection.remoteAddress,
    remotePort: nodeRequest.connection.remotePort,
    serverName: serverName,
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

var http = require('http');
var https = require('https');

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
 *              it is forecefully stopped when the process exits. Defaults to 100,
 *              meaning that servers forcefully shutdown after 100ms
 *   - key      Private key to use for SSL (HTTPS only)
 *   - cert     Public X509 certificate to use (HTTPS only)
 *
 * Note: When setting the timeout, be careful not to exceed any hard timeouts
 * specified by your PaaS. For example, Heroku's dyno manager will not permit
 * a timeout longer than ten seconds. See
 * https://devcenter.heroku.com/articles/dynos#graceful-shutdown-with-sigterm
 *
 * Returns the newly created HTTP server instance.
 */
exports.serve = function (app, options) {
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
    if (!options.quiet)
      console.log('>> Shutting down...');

    // Force the process to exit if the server doesn't
    // close all connections within the given timeout.
    var timer = setTimeout(function () {
      if (!options.quiet)
        console.log('>> Exiting');

      process.exit(0);
    }, options.timeout || 100);

    // Don't let this timer keep the event loop running.
    timer.unref();

    nodeServer.close();
  }

  nodeServer.once('listening', function () {
    exports.bind(app, nodeServer);

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);

    if (!options.quiet) {
      var address = nodeServer.address();
      var message = '>> mach web server version ' + exports.version + ' started on node ' + process.versions.node + '\n';

      if (typeof address === 'string') {
        message += '>> Listening on ' + address;
      } else {
        message += '>> Listening on ' + address.address;

        if (address.port)
          message += ':' + address.port;
      }

      message += ', use CTRL+C to stop';

      console.log(message);
    }
  });

  if (options.socket) {
    nodeServer.listen(options.socket);
  } else {
    nodeServer.listen(options.port || exports.defaultPort, options.host);
  }

  return nodeServer;
};

/**
 * A helper for constructing a mach response object with the given
 * content, status, and headers.
 *
 *   function (request) {
 *     return mach.send('That is not allowed', 403, { 'Content-Type': 'text/plain' });
 *   }
 */
exports.send = function (content, status, headers) {
  return { status: status, headers: headers, content: content };
};

/**
 * A helper for constructing a text response.
 *
 *   function (request) {
 *     return mach.text('That is not allowed', 403);
 *   }
 */
exports.text = function (text, status, headers) {
  headers = headers || {};
  headers['Content-Type'] = 'text/plain';
  return exports.send(text, status, headers);
};

/**
 * A helper for constructing an HTML (text/html) response.
 *
 *   function (request) {
 *     return mach.html('<p>Thank You</p>', 202);
 *   }
 */
exports.html = function (html, status, headers) {
  headers = headers || {};
  headers['Content-Type'] = 'text/html';
  return exports.send(html, status, headers);
};

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
exports.json = function (json, status, headers) {
  headers = headers || {};
  headers['Content-Type'] = 'application/json';
  return exports.send(typeof json === 'string' ? json : JSON.stringify(json), status, headers);
};

/**
 * A helper for constructing a redirect response. Defaults to using a 302
 * status if one isn't explicitly given.
 *
 *   function (request) {
 *     return mach.redirect('/another-url');
 *   }
 */
exports.redirect = function (location, status, headers) {
  headers = headers || {};
  headers['Location'] = location;
  status = status || 302;
  var html = '<p>You are being redirected to <a href="' + location + '">' + location + '</a></p>';
  return exports.html(html, status, headers);
};

/**
 * A helper for constructing a response that redirects the client to the
 * URL they came from (the one listed in the Referer header) or an optional
 * default location.
 *
 *   function (request) {
 *     return mach.back(request, '/default-location');
 *   }
 */
exports.back = function (request, defaultLocation) {
  return exports.redirect(request.headers.referer || defaultLocation || '/');
};

function textResponse(status, content) {
  content = content || exports.STATUS_CODES[status];

  return {
    status: status,
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(content)
    },
    content: content
  };
}

function makeTextResponder(status) {
  return function (content) {
    return textResponse(status, content);
  };
}

/**
 * Returns a text/plain 200 OK response.
 */
exports.ok = makeTextResponder(200);

/**
 * Returns a text/plain 400 Bad Request response.
 */
exports.badRequest = makeTextResponder(400);

/**
 * Returns a text/plain 401 Unauthorized response.
 */
exports.unauthorized = makeTextResponder(401);

/**
 * Returns a text/plain 403 Forbidden response.
 */
exports.forbidden = makeTextResponder(403);

/**
 * Returns a text/plain 404 Not Found response.
 */
exports.notFound = makeTextResponder(404);

/**
 * Returns a text/plain 413 Request Entity Too Large response.
 */
exports.requestEntityTooLarge = makeTextResponder(413);

/**
 * Returns a text/plain 500 Internal Server Error response.
 */
exports.internalServerError = makeTextResponder(500);

/**
 * The default application that is used as the root of routers and mappers
 * when no other app is given.
 */
exports.defaultApp = function (request) {
  return textResponse(404, 'Not Found: ' + request.method + ' ' + request.path);
};

/**
 * Creates and returns a mach.mapper from the location/app pairs in `map`.
 *
 *   var app = mach.map({
 *
 *     'http://example.com/images': function (request) {
 *       // The hostname used in the request was example.com, and the path
 *       // started with "/images".
 *     },
 *
 *     '/images': function (request) {
 *       // The request path started with "/images".
 *     }
 *
 *   });
 */
exports.map = function (map, defaultApp) {
  var mapper = exports.mapper(defaultApp);

  for (var location in map) {
    if (map.hasOwnProperty(location))
      mapper.map(location, map[location]);
  }

  return mapper;
};

var submodules = {
  basicAuth:        './middleware/basicAuth',
  catch:            './middleware/catch',
  contentType:      './middleware/contentType',
  errors:           './errors',
  favicon:          './middleware/favicon',
  file:             './middleware/file',
  headers:          './headers',
  gzip:             './middleware/gzip',
  logger:           './middleware/logger',
  mapper:           './middleware/mapper',
  methodOverride:   './middleware/methodOverride',
  modified:         './middleware/modified',
  multipart:        './multipart',
  params:           './middleware/params',
  Request:          './Request',
  rewrite:          './middleware/rewrite',
  router:           './middleware/router',
  session:          './middleware/session',
  stack:            './middleware/stack',
  token:            './middleware/token',
  utils:            './utils'
};

Object.keys(submodules).forEach(function (name) {
  module.exports.__defineGetter__(name, function () {
    return require(submodules[name]);
  });
});
