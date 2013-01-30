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
mach.defaultPort = 3333;

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
      request.done();
    }, function (error) {
      var stack = error.stack || error.toString();
      request.error.write('There was an unhandled error!\n' + stack + '\n');
      nodeResponse.writeHead(500, { 'Content-Type': 'text/plain' });
      nodeResponse.end('Internal Server Error');
      request.done();
    });
  });
}

/**
 * Creates and starts a node HTTP server.
 */
mach.serve = serveApp;
function serveApp(app, options) {
  options = options || {};

  var nodeServer;
  if (options.key && options.cert) {
    nodeServer = https.createServer(options);
  } else {
    nodeServer = http.createServer();
  }

  if (!options.quiet) {
    nodeServer.on('listening', function () {
      var address = nodeServer.address();
      var message = '>> mach web server version ' + mach.version + ' started on node ' + process.versions.node + '\n';
      message += '>> Listening on ' + address.address;
      if (address.port) message += ':' + address.port;
      message += ', CTRL+C to stop';
      console.log(message);
    });
  }

  mach.bind(app, nodeServer);
  nodeServer.listen(options.port || mach.defaultPort);

  return nodeServer;
}

// Expose modules.
var modulePaths = {
  basicAuth:      './basic-auth',
  commonLogger:   './common-logger',
  contentType:    './content-type',
  favicon:        './favicon',
  file:           './file',
  gzip:           './gzip',
  mapper:         './mapper',
  Request:        './request',
  router:         './router',
  Server:         './server',
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
