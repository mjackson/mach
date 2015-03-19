"use strict";

var Connection = require("../Connection");
var Location = require("../Location");

/**
 * Standard ports for HTTP protocols.
 */
var STANDARD_PORTS = {
  "http:": "80",
  "https:": "443"
};

function ensureTrailingColon(string) {
  return string[string.length - 1] === ":" ? string : string + ":";
}

/**
 * Creates a new Location object that is reverse-proxy aware.
 */
function createLocation(nodeRequest) {
  var headers = nodeRequest.headers;

  var protocol;
  if (process.env.HTTPS === "on" || headers["x-forwarded-ssl"] === "on" || headers["font-end-https"] === "on") {
    protocol = "https:";
  } else if (headers["x-url-scheme"]) {
    protocol = ensureTrailingColon(headers["x-url-scheme"]);
  } else if (headers["x-forwarded-protocol"]) {
    protocol = ensureTrailingColon(headers["x-forwarded-protocol"].split(",")[0]);
  } else if (headers["x-forwarded-proto"]) {
    protocol = ensureTrailingColon(headers["x-forwarded-proto"].split(",")[0]);
  } else {
    protocol = "http:";
  }

  var host;
  if (headers["x-forwarded-host"]) {
    var hosts = headers["x-forwarded-host"].split(/,\s?/);
    host = hosts[hosts.length - 1];
  } else if (headers.host) {
    host = headers.host;
  } else if (process.env.SERVER_NAME) {
    host = process.env.SERVER_NAME;
  }

  var hostParts = host.split(":", 2);
  var hostname = hostParts[0];
  var port = hostParts[1] || headers["x-forwarded-port"];

  if (port == null) {
    if (headers["x-forwarded-host"]) {
      port = STANDARD_PORTS[protocol];
    } else if (headers["x-forwarded-proto"]) {
      port = STANDARD_PORTS[headers["x-forwarded-proto"].split(",")[0]];
    }
  }

  var path = nodeRequest.url;

  return new Location({
    protocol: protocol,
    hostname: hostname,
    port: port,
    path: path
  });
}

/**
 * Creates a mach.Connection from the given node.js HTTP request and
 * server (optional) objects. This is a low-level method that is not
 * generally needed by application-level code.
 */
function createConnection(nodeRequest) {
  var conn = new Connection({
    version: nodeRequest.httpVersion,
    method: nodeRequest.method,
    location: createLocation(nodeRequest),
    headers: nodeRequest.headers,
    content: nodeRequest,
    remoteHost: nodeRequest.connection.remoteAddress,
    remotePort: nodeRequest.connection.remotePort
  });

  nodeRequest.on("close", function () {
    conn.onClose();
  });

  return conn;
}

module.exports = createConnection;