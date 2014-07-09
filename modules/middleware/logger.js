var strftime = require('strftime').strftime;

/**
 * A middleware that writes log entry data about the response to a given stream.
 * Log entries are formatted similarly to Apache httpd's Common Log Format
 * (see http://httpd.apache.org/docs/1.3/logs.html#common).
 */
function logger(app, outputStream) {
  outputStream = outputStream || process.stderr;

  return function (request) {
    var start = Date.now();

    return request.call(app).then(function (response) {
      var elapsedTime = (Date.now() - start) / 1000;
      var contentLength = response.headers['Content-Length'];

      if (contentLength == null)
        contentLength = '-';

      // 127.0.0.1 - frank [10/Oct/2000 13:55:36] "GET /apache_pb.gif HTTP/1.0" 200 2326 0.003
      var entry = [
        request.remoteHost || '-',
        '-', // RFC 1413 identity of the client
        request.remoteUser || '-',
        '[' + strftime('%d/%b/%Y %H:%M:%S', request.date) + ']',
        '"' + request.method + ' ' + request.fullPath + ' HTTP/' + request.protocolVersion + '"',
        response.status,
        contentLength,
        elapsedTime
      ].join(' ');

      outputStream.write(entry + '\n');

      return response;
    });
  };
}

module.exports = logger;
