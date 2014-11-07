var d = require('d');
var isBinary = require('./utils/isBinary');
var createProxy = require('./utils/createProxy');
var StatusCodes = require('./utils/StatusCodes');
var decodeBase64 = require('./utils/decodeBase64');
var encodeBase64 = require('./utils/encodeBase64');
var stringifyQuery = require('./utils/stringifyQuery');
var Promise = require('./utils/Promise');
var Location = require('./Location');
var Message = require('./Message');

function defaultErrorHandler(error) {
  if (typeof console !== 'undefined' && console.error) {
    console.error((error && error.stack) || error);
  } else {
    throw error; // Don't silently swallow errors!
  }
}

function defaultCloseHandler() {}

/**
 * An HTTP connection with request and response messages. Options
 * may be any of the following:
 *
 * - content    The request content, defaults to ""
 * - headers    The request headers, defaults to {}
 * - method     The request HTTP method, defaults to "GET"
 * - url        The request URL
 * - params     The request params
 * - onError    A function that is called when there is an error
 * - onClose    A function that is called when the request closes
 *
 * The options may also be a URL string to specify the URL.
 */
function Connection(options) {
  options = options || {};

  var location;
  if (typeof options === 'string') {
    location = options; // options may be a URL string.
  } else if (typeof options.url === 'string') {
    location = options.url;
  } else if (typeof window !== 'undefined') {
    location = window.location.href;
  }

  this.location = location;
  this.version = options.version || '1.1';
  this.method = options.method;

  this.onError = (options.onError || defaultErrorHandler).bind(this);
  this.onClose = (options.onClose || defaultCloseHandler).bind(this);
  this.request = new Message(options.content, options.headers);
  this.response = new Message;

  // Params may be given as an object.
  if (options.params) {
    var queryString = stringifyQuery(options.params);

    if (this.method === 'GET' || this.method === 'HEAD') {
      this.location.properties.search = '?' + queryString;
    } else {
      this.request.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      this.request.content = queryString;
    }
  }

  this.withCredentials = options.withCredentials || false;
  this.remoteHost = options.remoteHost || null;
  this.remoteUser = options.remoteUser || null;
  this.serverName = options.serverName || null;
  this.serverPort = options.serverPort || null;
  this.basename = '';

  this.responseText = null;
  this.status = 200;
}

function locationPropertyGetter(propertyName) {
  return d.gs(function () {
    return this.location[propertyName];
  });
}

Object.defineProperties(Connection.prototype, {

  /**
   * The method used in the request.
   */
  method: d.gs(function () {
    return this._method;
  }, function (value) {
    this._method = typeof value === 'string' ? value.toUpperCase() : 'GET';
  }),

  /**
   * The Location of the request.
   */
  location: d.gs(function () {
    return this._location;
  }, function (value) {
    this._location = (value instanceof Location) ? value : new Location(value);
  }),

  href: locationPropertyGetter('href'),
  protocol: locationPropertyGetter('protocol'),
  host: locationPropertyGetter('host'),
  hostname: locationPropertyGetter('hostname'),
  port: locationPropertyGetter('port'),
  search: locationPropertyGetter('search'),
  queryString: locationPropertyGetter('queryString'),
  query: locationPropertyGetter('query'),

  /**
   * The username:password used in the request, an empty string
   * if no auth was provided.
   */
  auth: d.gs(function () {
    var authHeader = this.request.headers['Authorization'];

    if (authHeader) {
      var parts = authHeader.split(' ', 2);
      var scheme = parts[0];

      if (scheme.toLowerCase() === 'basic')
        return decodeBase64(parts[1]);

      return authHeader;
    }

    return this.location.auth;
  }, function (value) {
    var headers = this.request.headers;

    if (value && typeof value === 'string') {
      headers['Authorization'] = 'Basic ' + encodeBase64(value);
    } else {
      delete headers['Authorization'];
    }
  }),

  /**
   * The portion of the original URL path that is still relevant
   * for request processing.
   */
  pathname: d.gs(function () {
    return this.location.pathname.replace(this.basename, '') || '/';
  }),

  /**
   * The URL path with query string.
   */
  path: d.gs(function () {
    return this.pathname + this.search;
  }),

  /**
   * The message that corresponds with the response status code.
   */
  statusText: d.gs(function () {
    return StatusCodes[this.status];
  }),

  /**
   * Calls the given `app` with this connection as the only argument.
   * as the first argument and returns a promise for a Response.
   */
  call: d(function (app) {
    if (typeof app !== 'function')
      app = createProxy(app || this);

    var conn = this;

    try {
      return Promise.resolve(app(conn)).then(function (value) {
        if (value == null)
          return;

        if (typeof value === 'number') {
          conn.status = value;
        } else if (typeof value === 'string' || isBinary(value) || typeof value.pipe === 'function') {
          conn.response.content = value;
        } else {
          if (value.headers != null)
            conn.response.headers = value.headers;

          if (value.content != null)
            conn.response.content = value.content;

          if (value.status != null)
            conn.status = value.status;
        }
      });
    } catch (error) {
      return Promise.reject(error);
    }
  })

});

module.exports = Connection;
