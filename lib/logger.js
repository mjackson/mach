var strftime = require('strftime').strftime;
module.exports = makeLogger;

/**
 * A middleware that writes log entry data about the response to a given stream.
 * Log entries are formatted similarly to Apache httpd's Common Log Format
 * (see http://httpd.apache.org/docs/1.3/logs.html#common).
 */
function makeLogger(app, stream) {
  stream = stream || process.stderr;

  function logger(request) {
    var start = Date.now();

    return request.call(app).then(function (response) {
      var host = request.remoteHost || '-';
      var id = '-'; // RFC 1413 identity of the client determined by identd on the client's machine
      var user = request.remoteUser || '-';
      var timestamp = '[' + strftime('%d/%b/%Y %H:%M:%S', request.date) + ']';
      var info = '"' + request.method + ' ' + request.fullPath + ' HTTP/' + request.protocolVersion + '"';
      var contentLength = response.headers['Content-Length'];
      var length = contentLength == null ? '-' : contentLength;
      var duration = (Date.now() - start) / 1000;

      // 127.0.0.1 - frank [10/Oct/2000 13:55:36] "GET /apache_pb.gif HTTP/1.0" 200 2326 0.003
      var entry = [ host, id, user, timestamp, info, response.status, length, duration ].join(' ');
      stream.write(entry + '\n');

      return response;
    });
  }

  return logger;
}
