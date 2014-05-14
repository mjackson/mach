var strftime = require('strftime').strftime;
var microtime
try {
  microtime = require('microtime');
} catch(err) {
  console.log("Microtime not available -> logging millisecond durations")
}

/**
 * A middleware that writes log entry data about the response to a given stream.
 * Log entries are formatted similarly to Apache httpd's Common Log Format
 * (see http://httpd.apache.org/docs/1.3/logs.html#common).
 */
module.exports = function (app, outputStream) {
  outputStream = outputStream || process.stderr;

  return function (request) {
    var start
    if (microtime) {
      start = microtime.now();
    } else {
      start = Date.now()
    }

    return request.call(app).then(function (response) {
      var host = request.remoteHost || '-';
      var id = '-'; // RFC 1413 identity of the client determined by identd on the client's machine
      var user = request.remoteUser || '-';
      var timestamp = '[' + strftime('%d/%b/%Y %H:%M:%S', request.date) + ']';
      var info = '"' + request.method + ' ' + request.fullPath + ' HTTP/' + request.protocolVersion + '"';

      var contentLength = response.headers['Content-Length'];
      if (contentLength == null)
        contentLength = '-';

      var seconds
      if (microtime) {
        var elapsedMicroseconds = microtime.now() - start;
        seconds = Math.round(elapsedMicroseconds / 100) / 10000;
      } else {
        seconds = Date.now() - start
      }

      // 127.0.0.1 - frank [10/Oct/2000 13:55:36] "GET /apache_pb.gif HTTP/1.0" 200 2326 0.003
      var entry = [ host, id, user, timestamp, info, response.status, contentLength, seconds ].join(' ');

      outputStream.write(entry + '\n');

      return response;
    });
  };
};
