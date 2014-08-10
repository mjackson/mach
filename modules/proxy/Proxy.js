var d = require('d');
var sendRequest = require('./utils/sendRequest');
var parseURL = require('./utils/parseURL');

/**
 * An HTTP proxy.
 */
function Proxy(options) {
  options = options || {};

  if (typeof options === 'string')
    options = parseURL(options);

  if (!options.hostname)
    throw new Error('Proxy needs a hostname');

  this.protocol = options.protocol || 'http:';
  this.auth = options.auth || '';
  this.hostname = options.hostname;
  this.port = String(options.port || '80');
  this.path = options.path || '';
}

Object.defineProperties(Proxy.prototype, {

  /**
   * Returns a promise for a response from sending the given request
   * to the downstream proxy server.
   */
  call: d(function (request) {
    return sendRequest({
      method: request.method,
      protocol: this.protocol,
      auth: this.auth,
      hostname: this.hostname,
      port: this.port,
      path: this.path,
      headers: request.headers,
      content: request.content
    });
  })

});

module.exports = Proxy;
