var d = require('d');
var mergeQuery = require('./utils/mergeQuery');
var stringifyQuery = require('./utils/stringifyQuery');
var parseQuery = require('./utils/parseQuery');
var parseURL = require('./utils/parseURL');

/**
 * Standard ports for HTTP protocols.
 */
var STANDARD_PORTS = {
  'http:': '80',
  'https:': '443'
};

function propertyAlias(propertyName, defaultValue) {
  return d.gs(function () {
    return this.properties[propertyName] || defaultValue;
  }, function (value) {
    this.properties[propertyName] = value;
  });
}

function setProperties(location, properties) {
  [ 'protocol', 'auth', 'hostname', 'port', 'pathname', 'search' ].forEach(function (name) {
    if (properties.hasOwnProperty(name))
      location[name] = properties[name];
  });
}

/**
 * A URL location, analogous to window.location.
 *
 * Options may be any of the following:
 *
 * - protocol
 * - auth
 * - hostname
 * - port
 * - pathname
 * - search
 *
 * Alternatively, options may be a URL string.
 */
function Location(options) {
  this.properties = {};

  if (typeof options === 'string') {
    this.href = options;
  } else if (options) {
    setProperties(this, options);
  }
}

Object.defineProperties(Location.prototype, {

  /**
   * Creates and returns a new Location with the path and query of
   * the given location appended.
   */
  concat: d(function (location) {
    if (!(location instanceof Location))
      location = new Location(location);

    var pathname = this.pathname;
    var extraPathname = location.pathname;

    if (extraPathname !== '/')
      pathname = pathname.replace(/\/*$/, '/') + extraPathname.replace(/^\/*/, '');

    var search = '?' + stringifyQuery(mergeQuery(this.query, parseQuery(location.query)));

    return new Location({
      protocol: this.properties.protocol || location.protocol,
      auth: this.properties.auth || location.auth,
      hostname: this.properties.hostname || location.auth,
      port: this.properties.port || location.port,
      pathname: pathname,
      search: search
    });
  }),

  /**
   * The full URL.
   */
  href: d.gs(function () {
    var auth = this.auth;
    var host = this.host;
    var path = this.path;

    return host ? (this.protocol + '//' + (auth ? auth + '@' : '') + host + path) : path;
  }, function (value) {
    setProperties(this, parseURL(value));
  }),

  /**
   * The portion of the URL that denotes the protocol, including the
   * trailing colon (e.g. "http:" or "https:").
   */
  protocol: propertyAlias('protocol', 'http:'),

  /**
   * The username:password used in the URL, if any.
   */
  auth: propertyAlias('auth', ''),

  /**
   * The full name of the host, including the port number when using
   * a non-standard port.
   */
  host: d.gs(function () {
    var protocol = this.protocol;
    var host = this.hostname;
    var port = this.port;

    if (port != null && port !== STANDARD_PORTS[protocol])
      host += ':' + port;

    return host;
  }, function (value) {
    var index;

    if (typeof value === 'string' && (index = value.indexOf(':')) !== -1) {
      this.hostname = value.substring(0, index);
      this.port = value.substring(index + 1);
    } else {
      this.hostname = value;
      this.port = null;
    }
  }),

  /**
   * The name of the host without the port.
   */
  hostname: propertyAlias('hostname', ''),

  /**
   * The port number as a string.
   */
  port: d.gs('port', function () {
    return this.properties.port;
  }, function (value) {
    this.properties.port = String(value || STANDARD_PORTS[this.protocol]);
  }),

  /**
   * The URL path without the query string.
   */
  pathname: propertyAlias('pathname', '/'),

  /**
   * The URL path with query string.
   */
  path: d.gs(function () {
    return this.pathname + this.search;
  }, function (value) {
    var index;

    if (typeof value === 'string' && (index = value.indexOf('?')) !== -1) {
      this.pathname = value.substring(0, index);
      this.search = value.substring(index);
    } else {
      this.pathname = value;
      this.search = null;
    }
  }),

  /**
   * The query string, including the preceeding ?.
   */
  search: propertyAlias('search', ''),

  /**
   * The query string of the URL, without the preceeding ?.
   */
  queryString: d.gs(function () {
    return this.search.substring(1);
  }, function (value) {
    this.search = value && '?' + value;
  }),

  /**
   * An object of data in the query string.
   */
  query: d.gs(function () {
    return parseQuery(this.queryString);
  }, function (value) {
    this.queryString = stringifyQuery(value);
  }),

  toJSON: d(function () {
    return this.href;
  }),

  toString: d(function () {
    return this.href;
  })

});

module.exports = Location;
