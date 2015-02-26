"use strict";

/* jshint -W058 */
var strftime = require("strftime").strftime;

function defaultMessageHandler(message) {
  if (typeof console !== "undefined" && console.log) console.log(message);
}

/**
 * A middleware that writes log entry data about the response to a given stream.
 * Log entries are formatted similarly to Apache httpd's Common Log Format
 * (see http://httpd.apache.org/docs/1.3/logs.html#common).
 */
function logger(app, messageHandler) {
  messageHandler = messageHandler || defaultMessageHandler;

  return function (conn) {
    var startTime = Date.now();

    return conn.call(app).then(function () {
      var elapsedTime = Date.now() - startTime;
      var contentLength = conn.response.headers["Content-Length"];

      if (contentLength == null) contentLength = "-";

      var protocol = conn.protocol || "http:";
      protocol = protocol.substr(0, protocol.length - 1).toUpperCase();

      // 127.0.0.1 - frank [10/Oct/2000 13:55:36] "GET /apache_pb.gif HTTP/1.0" 200 2326 0.003
      messageHandler([conn.remoteHost || "-", "-", // RFC 1413 identity of the client
      conn.remoteUser || "-", "[" + strftime("%d/%b/%Y %H:%M:%S", new Date()) + "]", "\"" + conn.method + " " + conn.basename + conn.path + " " + protocol + "/" + conn.version + "\"", conn.status, contentLength, elapsedTime / 1000].join(" "));
    });
  };
}

module.exports = logger;