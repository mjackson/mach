var Request = require('./request');
var utils = require('./utils');
var mach = module.exports;

/**
 * The current version of mach.
 */
mach.version = '0.1';

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
