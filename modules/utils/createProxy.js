var d = require('d');
var sendRequest = require('./sendRequest');
var parseURL = require('./parseURL');

/**
 * A mach.proxy is a function that is used to send a request to
 * a remote URL and retrieve the response. Options may be a URL
 * string or an object with any of the following properties:
 *
 * - protocol
 * - auth
 * - hostname
 * - port
 * - path
 *
 * This function is part of the low-level API and can generally be
 * used more conveniently either through the client methods or the
 * mach.forward middleware.
 */
function createProxy(options) {
  options = options || {};

  if (typeof options === 'string')
    options = parseURL(options);

  if (!options.hostname)
    throw new Error('mach.proxy needs a hostname');

  var protocol = (options.protocol || 'http:').toLowerCase();
  var auth = options.auth || '';
  var hostname = options.hostname;
  var port = String(options.port || (protocol === 'https:' ? 443 : 80));
  var path = options.path || '';

  return function (request) {
    return sendRequest({
      method: request.method,
      protocol: protocol,
      auth: auth,
      hostname: hostname,
      port: port,
      path: path,
      headers: request.headers,
      content: request.content
    });
  };
}

module.exports = createProxy;
