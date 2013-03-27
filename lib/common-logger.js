var strftime = require('strftime').strftime;

module.exports = commonLogger;

/**
 * A middleware that writes log entry data about the response to a given
 * stream. Log entries are formatted using Apache httpd's Common Log Format
 * (see http://httpd.apache.org/docs/1.3/logs.html#common).
 */
function commonLogger(app, stream) {
  stream = stream || process.stderr;

  return function (request) {
    return request.call(app).then(function (response) {
      var host = request.remoteHost || '-';
      var id = '-'; // RFC 1413 identity of the client determined by identd on the client's machine
      var user = request.remoteUser || '-';
      var timestamp = '[' + strftime('%d/%b/%Y:%H:%M:%S %z', request.date) + ']';
      var info = '"' + request.method + ' ' + request.fullPath + ' HTTP/' + request.protocolVersion + '"';
      var length = response.headers['Content-Length'] || '-';

      // LogFormat "%h %l %u %t \"%r\" %>s %b" common
      // 127.0.0.1 - frank [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326
      var entry = [host, id, user, timestamp, info, response.status, length].join(' ');
      stream.write(entry + '\n');

      return response;
    });
  };
}
