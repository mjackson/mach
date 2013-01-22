var http = require('http');
var https = require('https');
var Request = require('./request');
var mach = module.exports;

/**
 * The current version of mach.
 */
mach.version = '0.0.0';

/**
 * The default port to use in mach.serve.
 */
mach.port = 3333;

/**
 * Binds the given app to the "request" event of the given server so that it
 * is called whenever the server receives a new request.
 */
mach.bind = bindAppToNodeServer;
function bindAppToNodeServer(app, nodeServer) {
  nodeServer.on('request', function (nodeRequest, nodeResponse) {
    var request = Request.makeFromNodeRequest(nodeServer, nodeRequest);

    request.call(app).then(function (response) {
      nodeResponse.writeHead(response.status, response.headers);
      response.content.resume();
      response.content.pipe(nodeResponse);
    }, function (error) {
      var stack = error.stack;

      if (!stack) {
        // Provide as much information as we can, even though the error
        // doesn't have a proper stack trace.
        stack = (error.name || 'Error') + ': ' + error.message;
      }

      request.error.write('There was an unhandled error!\n' + stack + '\n');

      nodeResponse.writeHead(500, { 'Content-Type': 'text/plain' });
      nodeResponse.end('Server Error');
    });
  });
}

/**
 * Creates and starts a node HTTP server.
 */
mach.serve = serveApp;
function serveApp(app, options) {
  options = options || {};

  var server;
  if (options.key && options.cert) {
    server = https.createServer(options);
  } else {
    server = http.createServer();
  }

  bindAppToNodeServer(app, server);

  if (!options.quiet) {
    server.on('listening', function () {
      var address = server.address();
      var message = '>> mach web server version ' + mach.version + ' started on node ' + process.versions.node + '\n';
      message += '>> Listening on ' + address.address;
      if (address.port) message += ':' + address.port;
      message += ', CTRL+C to stop';
      console.log(message);
    });
  }

  server.listen(options.port || mach.port);

  return server;
}

// Expose modules.
var modulePaths = {
  basicAuth:      './basic-auth',
  commonLogger:   './common-logger',
  contentType:    './content-type',
  favicon:        './favicon',
  file:           './file',
  mapper:         './mapper',
  Request:        './request',
  router:         './router',
  Server:         './server',
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
