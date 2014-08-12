// This example demonstrates how mach can be used to create a server
// that streams content back to the client. The best way to see the
// streaming data is probably using curl or netcat, i.e.
// curl http://localhost:5000

var Stream = require('bufferedstream');
var mach = require('../modules');

mach.serve(function (request, response) {
  // Set response.content to the stream you want to send.
  // In this example, the stream is an infinite stream of
  // timestamps. In normal usage you'll probably use one
  // of node's readables (e.g. fs.createReadStream).
  response.content = new Stream;

  // Delete the Content-Length header to prevent clients
  // from prematurely closing the connection since we're
  // sending an indeterminate amount of data. If we know
  // the length of the data (e.g. the size of a readable
  // file stream) we would set this accordingly.
  delete response.headers['Content-Length'];

  var timer = setInterval(function () {
    response.content.write((new Date).toString() + '\n');
  }, 1000);

  request.onClose = function () {
    console.log('client closed connection');
    clearInterval(timer);
  };
});
