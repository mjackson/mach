var http = require('http');
var https = require('https');
var bindApp = require('./bindApp');

/**
 * The default port that node servers bind to.
 */
var DEFAULT_PORT = 5000;

/**
 * Creates and starts a node HTTP server that serves the given app.
 *
 * Options may be any of the following:
 *
 * - host     The host name to accept connections on. Defaults to INADDR_ANY
 * - port     The port to listen on. Defaults to 5000
 * - socket   Unix socket file to listen on (trumps host/port)
 * - quiet    Set true to prevent the server from writing startup/shutdown
 *            messages to the console. Defaults to false
 * - timeout  The timeout to use when gracefully shutting down servers when
 *            SIGINT or SIGTERM are received. If a server doesn't close within
 *            this time (probably because it has open persistent connections)
 *            it is forecefully stopped when the process exits. Defaults to 100,
 *            meaning that servers forcefully shutdown after 100ms
 * - key      Private key to use for SSL (HTTPS only)
 * - cert     Public X509 certificate to use (HTTPS only)
 *
 * Note: When setting the timeout, be careful not to exceed any hard timeouts
 * specified by your PaaS. For example, Heroku's dyno manager will not permit
 * a timeout longer than ten seconds. See
 * https://devcenter.heroku.com/articles/dynos#graceful-shutdown-with-sigterm
 *
 * Returns the node HTTP server instance.
 */
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
    bindApp(app, nodeServer);

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);

    if (!options.quiet) {
      var address = nodeServer.address();
      var message = '>> mach web server started on node ' + process.versions.node + '\n';

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
    nodeServer.listen(options.port || DEFAULT_PORT, options.host);
  }

  return nodeServer;
}

module.exports = serveApp;
