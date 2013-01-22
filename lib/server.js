var http = require('http');
var mach = require('./index');

module.exports = Server;

function Server(app) {
  var server = http.createServer();
  mach.bind(app, server);
  return server;
}
