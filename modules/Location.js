var d = require('d');
var parseQuery = require('./utils/parseQuery');
var parseURL = require('./utils/parseURL');

function propertyGetter(propertyName) {
  return d.gs(function () {
    return this.properties[propertyName];
  });
}

/**
 * A URL location, analogous to window.location. The options may
 * be a URL string or an object with any of the following properties:
 *
 * - protocol
 * - auth
 * - hostname (required)
 * - port
 * - pathname
 * - search
 *
 * Note: This object is currently read-only.
 */
function Location(options) {
  if (typeof options === 'string')
    options = parseURL(options);

  if (options == null || !options.hostname)
    throw new Error('Location needs a hostname');

  var protocol = (options.protocol || 'http:').toLowerCase();
  var port = String(options.port || (protocol === 'https:' ? 443 : 80));

  this.properties = {
    protocol: protocol,
    auth: options.auth || '',
    hostname: options.hostname,
    port: port,
    pathname: options.pathname || '/',
    search: options.search || ''
  };
}

Object.defineProperties(Location.prototype, {

  /**
   * The full URL.
   */
  href: d.gs(function () {
    return this.protocol + '//' + (this.auth ? this.auth + '@' : '') + this.host + this.path;
  }),

  /**
   * The portion of the URL that denotes the protocol, including the
   * trailing colon (e.g. "http:" or "https:").
   */
  protocol: propertyGetter('protocol'),

  /**
   * The username:password used in the URL, if any.
   */
  auth: d.gs(function () {
    return this.properties.auth || '';
  }),

  /**
   * The full name of the host, including the port number when using
   * a non-standard port.
   */
  host: d.gs(function () {
    var protocol = this.protocol;
    var host = this.hostname;
    var port = this.port;

    if (!(port === '80' && protocol === 'http:' || port === '443' && protocol === 'https:'))
      host += ':' + port;

    return host;
  }),

  /**
   * The name of the host without the port.
   */
  hostname: propertyGetter('hostname'),

  /**
   * The port number as a string.
   */
  port: propertyGetter('port'),

  /**
   * The URL path without the query string.
   */
  pathname: propertyGetter('pathname'),

  /**
   * The URL path with query string.
   */
  path: d.gs(function () {
    return this.pathname + this.search;
  }),

  /**
   * The query string, including the preceeding ?.
   */
  search: propertyGetter('search'),

  /**
   * The query string of the URL, without the preceeding ?.
   */
  queryString: d.gs(function () {
    return this.search.substring(1);
  }),

  /**
   * An object of data in the query string.
   */
  query: d.gs(function () {
    return parseQuery(this.queryString);
  })

});

module.exports = Location;
