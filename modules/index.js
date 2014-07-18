/**
 * The current version of mach.
 */
exports.version = require('../package').version;

/**
 * A map of HTTP status codes to their descriptions.
 */
exports.STATUS_CODES = {
  100: 'Continue',
  101: 'Switching Protocols',
  102: 'Processing',                       // RFC 2518, obsoleted by RFC 4918
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  207: 'Multi-Status',                     // RFC 4918
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Moved Temporarily',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Time-out',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Request Entity Too Large',
  414: 'Request-URI Too Large',
  415: 'Unsupported Media Type',
  416: 'Requested Range Not Satisfiable',
  417: 'Expectation Failed',
  418: "I'm a teapot",                     // RFC 2324
  422: 'Unprocessable Entity',             // RFC 4918
  423: 'Locked',                           // RFC 4918
  424: 'Failed Dependency',                // RFC 4918
  425: 'Unordered Collection',             // RFC 4918
  426: 'Upgrade Required',                 // RFC 2817
  428: 'Precondition Required',            // RFC 6585
  429: 'Too Many Requests',                // RFC 6585
  431: 'Request Header Fields Too Large',  // RFC 6585
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',          // RFC 2295
  507: 'Insufficient Storage',             // RFC 4918
  509: 'Bandwidth Limit Exceeded',
  510: 'Not Extended',                     // RFC 2774
  511: 'Network Authentication Required'   // RFC 6585
};

/**
 * The default application that is used as the root of routers and mappers
 * when no other app is given.
 */
exports.defaultApp = function (request) {
  return exports.text('Not Found: ' + request.method + ' ' + request.path, 404);
};

/**
 * A helper for constructing a mach response object with the given
 * content, status, and headers.
 *
 *   function (request) {
 *     return mach.send('That is not allowed', 403, { 'Content-Type': 'text/plain' });
 *   }
 */
exports.send = function (content, status, headers) {
  return new exports.Response({ status: status, headers: headers, content: content });
};

/**
 * A helper for constructing a text response.
 *
 *   function (request) {
 *     return mach.text('That is not allowed', 403);
 *   }
 */
exports.text = function (text, status, headers) {
  headers = headers || {};
  headers['Content-Type'] = 'text/plain';
  return exports.send(text, status, headers);
};

/**
 * A helper for constructing an HTML (text/html) response.
 *
 *   function (request) {
 *     return mach.html('<p>Thank You</p>', 202);
 *   }
 */
exports.html = function (html, status, headers) {
  headers = headers || {};
  headers['Content-Type'] = 'text/html';
  return exports.send(html, status, headers);
};

/**
 * A helper for constructing a JSON (application/json) response. You
 * can pass a JSON string directly:
 *
 *   function (request) {
 *     return mach.json('{"some":"json"}', 200);
 *   }
 *
 * or use an object that will be JSON.stringify'd:
 *
 *   function (request) {
 *     return mach.json(myObject);
 *   }
 */
exports.json = function (json, status, headers) {
  headers = headers || {};
  headers['Content-Type'] = 'application/json';
  return exports.send(typeof json === 'string' ? json : JSON.stringify(json), status, headers);
};

/**
 * A helper for constructing a redirect response. Defaults to using a 302
 * status if one isn't explicitly given.
 *
 *   function (request) {
 *     return mach.redirect('/another-url');
 *   }
 */
exports.redirect = function (location, status, headers) {
  headers = headers || {};
  headers['Location'] = location;
  status = status || 302;
  var html = '<p>You are being redirected to <a href="' + location + '">' + location + '</a></p>';
  return exports.html(html, status, headers);
};

/**
 * A helper for constructing a response that redirects the client to the
 * URL they came from (the one listed in the Referer header) or an optional
 * default location.
 *
 *   function (request) {
 *     return mach.back(request, '/default-location');
 *   }
 */
exports.back = function (request, defaultLocation) {
  return exports.redirect(request.headers.referer || defaultLocation || '/');
};

var submodules = {
  basicAuth:        './middleware/basicAuth',
  bind:             './utils/bindApp',
  catch:            './middleware/catch',
  contentType:      './middleware/contentType',
  errors:           './errors',
  favicon:          './middleware/favicon',
  file:             './middleware/file',
  headers:          './headers',
  gzip:             './middleware/gzip',
  logger:           './middleware/logger',
  map:              './utils/makeMapper',
  mapper:           './middleware/mapper',
  Message:          './Message',
  methodOverride:   './middleware/methodOverride',
  modified:         './middleware/modified',
  multipart:        './multipart',
  params:           './middleware/params',
  Request:          './Request',
  Response:         './Response',
  rewrite:          './middleware/rewrite',
  router:           './middleware/router',
  serve:            './utils/serveApp',
  session:          './middleware/session',
  stack:            './middleware/stack',
  token:            './middleware/token',
  utils:            './utils'
};

Object.keys(submodules).forEach(function (name) {
  module.exports.__defineGetter__(name, function () {
    return require(submodules[name]);
  });
});
