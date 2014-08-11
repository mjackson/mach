var d = require('d');
var Promise = require('bluebird').Promise;
var parseCookie = require('./utils/parseCookie');
var parseQuery = require('./utils/parseQuery');
var Message = require('./Message');
var Response = require('./Response');

var defaultErrorHandler;
if (typeof process !== 'undefined' && process.stderr) {
  defaultErrorHandler = function (errorMessage) {
    process.stderr.write(errorMessage + '\n');
  };
} else if (typeof console !== 'undefined' && typeof console.error === 'function') {
  defaultErrorHandler = function (errorMessage) {
    console.error(errorMessage);
  };
}

function defaultCloseHandler() {}

/**
 * An HTTP request.
 *
 * A new Request is created for each new client request. It serves as the
 * concurrency primitive for the duration of the request handling process.
 *
 * Options may be any of the following:
 *
 *   - headers            An object of HTTP headers and values
 *   - content            A readable stream containing the message content
 *   - onError            A handler function for error messages
 *   - onClose            A handler function for closed connections
 *   - protocol           The protocol being used (i.e. "http:" or "https:")
 *   - protocolVersion    The protocol version
 *   - method             The request method (e.g. "GET" or "POST")
 *   - remoteHost         The IP address of the client
 *   - remotePort         The port number being used on the client machine
 *   - serverName         The host name of the server
 *   - serverPort         The port the server is listening on
 *   - queryString        The query string used in the request
 *   - scriptName         The virtual location of the application on the server
 *   - pathInfo/path      The path used in the request
 */
function Request(options) {
  options = options || {};

  Message.call(this, options.content, options.headers);

  var errorHandler = options.onError || defaultErrorHandler;
  if (typeof errorHandler !== 'function')
    throw new Error('Request needs an error handler');

  var closeHandler = options.onClose || defaultCloseHandler;
  if (typeof closeHandler !== 'function')
    throw new Error('Request needs a close handler');

  this.onError = errorHandler;
  this.onClose = closeHandler;
  this._protocol = (options.protocol || 'http:').toLowerCase();
  this.protocolVersion = options.protocolVersion || '1.0';
  this.method = (options.method || 'GET').toUpperCase();
  this._remoteHost = options.remoteHost || '';
  this.remotePort = String(options.remotePort || '0');
  this.serverName = options.serverName || '';
  this.serverPort = String(options.serverPort || (this.isSSL ? '443' : '80'));
  this.queryString = options.queryString || '';
  this.scriptName = options.scriptName || '';
  this.pathInfo = options.pathInfo || options.path || '';

  // Make sure pathInfo is at least '/'.
  if (this.scriptName === '' && this.pathInfo === '')
    this.pathInfo = '/';
}

Request.prototype = Object.create(Message.prototype, {

  constructor: d(Request),

  /**
   * Gets/sets the value of the Authorization header.
   */
  auth: d.gs(function () {
    return this.headers['Authorization'];
  }, function (value) {
    this.headers['Authorization'] = value;
  }),

  /**
   * An object containing cookies that were used in the request, keyed by name.
   */
  cookies: d.gs(function () {
    if (!this._cookies) {
      if (this.headers['Cookie']) {
        var cookies = parseCookie(this.headers['Cookie']);

        // From RFC 2109:
        // If multiple cookies satisfy the criteria above, they are ordered in
        // the Cookie header such that those with more specific Path attributes
        // precede those with less specific. Ordering with respect to other
        // attributes (e.g., Domain) is unspecified.
        for (var cookieName in cookies) {
          if (Array.isArray(cookies[cookieName]))
            cookies[cookieName] = cookies[cookieName][0] || '';
        }

        this._cookies = cookies;
      } else {
        this._cookies = {};
      }
    }

    return this._cookies;
  }),

  /**
   * The protocol used in the request (i.e. "http:" or "https:").
   */
  protocol: d.gs(function () {
    if (this.headers['X-Forwarded-Ssl'] === 'on')
      return 'https:';

    if (this.headers['X-Forwarded-Proto'])
      return this.headers['X-Forwarded-Proto'].split(',')[0] + ':';

    return this._protocol;
  }),

  /**
   * True if this request was made over SSL.
   */
  isSSL: d.gs(function () {
    return this.protocol === 'https:';
  }),

  /**
   * Returns a string of the hostname:port used in this request.
   */
  host: d.gs(function () {
    var forwardedHost = this.headers['X-Forwarded-Host'];

    if (forwardedHost) {
      var parts = forwardedHost.split(/,\s?/);
      return parts[parts.length - 1];
    }

    if (this.headers['Host'])
      return this.headers['Host'];

    if (this.serverPort)
      return this.serverName + ':' + this.serverPort;

    return this.serverName;
  }),

  /**
   * Returns the name of the host used in this request.
   */
  hostname: d.gs(function () {
    return this.host.replace(/:\d+$/, '');
  }),

  /**
   * Returns the port number used in this request.
   */
  port: d.gs(function () {
    var port = this.host.split(':')[1] || this.headers['X-Forwarded-Port'];

    if (port)
      return port;

    if (this.isSSL)
      return '443';

    if (this.headers['X-Forwarded-Host'])
      return '80';

    return this.serverPort;
  }),

  /**
   * The full path of this request, including the query string.
   */
  path: d.gs(function () {
    return this.pathname + this.search;
  }),

  /**
   * The path of this request, without the query string.
   */
  pathname: d.gs(function () {
    return this.scriptName + this.pathInfo;
  }),

  /**
   * The query string of the URL, including the leading question mark.
   */
  search: d.gs(function () {
    return this.queryString ? '?' + this.queryString : '';
  }),

  /**
   * An object containing the properties and values that were URL-encoded in
   * the query string.
   */
  query: d.gs(function () {
    if (!this._query)
      this._query = parseQuery(this.queryString);

    return this._query;
  }),

  /**
   * The original URL of this request.
   */
  url: d.gs(function () {
    return this.protocol + '//' + this.host + this.path;
  }),

  /**
   * Calls the given `app` in the scope of this request with this request
   * as the first argument and returns a promise for a Response.
   */
  call: d(function (app) {
    var request = this;
    var response = request._response;

    if (response == null)
      response = request._response = new Response;

    try {
      return Promise.resolve(app(request, response)).then(function (value) {
        if (value !== response && value != null) {
          if (value instanceof Response) {
            response = request._response = value;
          } else if (typeof value === 'number') {
            response.status = value;
          } else if (typeof value === 'string' || Buffer.isBuffer(value) || typeof value.pipe === 'function') {
            response.content = value;
          } else {
            if (value.status != null)
              response.status = value.status;

            if (value.headers != null)
              response.headers = value.headers;

            if (value.content != null)
              response.content = value.content;
          }
        }

        return response;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  })

});

module.exports = Request;
