var qs = require('querystring');
var url = require('url');
var mime = require('mime');
var q = require('q');

var utils = module.exports;

var STATUS_CODES = utils.STATUS_CODES = {
  100 : 'Continue',
  101 : 'Switching Protocols',
  102 : 'Processing',                       // RFC 2518, obsoleted by RFC 4918
  200 : 'OK',
  201 : 'Created',
  202 : 'Accepted',
  203 : 'Non-Authoritative Information',
  204 : 'No Content',
  205 : 'Reset Content',
  206 : 'Partial Content',
  207 : 'Multi-Status',                     // RFC 4918
  300 : 'Multiple Choices',
  301 : 'Moved Permanently',
  302 : 'Moved Temporarily',
  303 : 'See Other',
  304 : 'Not Modified',
  305 : 'Use Proxy',
  307 : 'Temporary Redirect',
  400 : 'Bad Request',
  401 : 'Unauthorized',
  402 : 'Payment Required',
  403 : 'Forbidden',
  404 : 'Not Found',
  405 : 'Method Not Allowed',
  406 : 'Not Acceptable',
  407 : 'Proxy Authentication Required',
  408 : 'Request Time-out',
  409 : 'Conflict',
  410 : 'Gone',
  411 : 'Length Required',
  412 : 'Precondition Failed',
  413 : 'Request Entity Too Large',
  414 : 'Request-URI Too Large',
  415 : 'Unsupported Media Type',
  416 : 'Requested Range Not Satisfiable',
  417 : 'Expectation Failed',
  418 : 'I\'m a teapot',                    // RFC 2324
  422 : 'Unprocessable Entity',             // RFC 4918
  423 : 'Locked',                           // RFC 4918
  424 : 'Failed Dependency',                // RFC 4918
  425 : 'Unordered Collection',             // RFC 4918
  426 : 'Upgrade Required',                 // RFC 2817
  428 : 'Precondition Required',            // RFC 6585
  429 : 'Too Many Requests',                // RFC 6585
  431 : 'Request Header Fields Too Large',  // RFC 6585
  500 : 'Internal Server Error',
  501 : 'Not Implemented',
  502 : 'Bad Gateway',
  503 : 'Service Unavailable',
  504 : 'Gateway Time-out',
  505 : 'HTTP Version not supported',
  506 : 'Variant Also Negotiates',          // RFC 2295
  507 : 'Insufficient Storage',             // RFC 4918
  509 : 'Bandwidth Limit Exceeded',
  510 : 'Not Extended',                     // RFC 2774
  511 : 'Network Authentication Required'   // RFC 6585
};

var _slice = Array.prototype.slice;

utils.slice = slice;
function slice(object) {
  return _slice.apply(object, _slice.call(arguments, 1));
}

var _toString = Object.prototype.toString;

/**
 * Returns true if the given object is a RegExp, false otherwise.
 */
utils.isRegExp = isRegExp;
function isRegExp(object) {
  return _toString.call(object) === '[object RegExp]';
}

/**
 * Escapes all special regular expression characters in the given string.
 */
utils.escapeRegExp = escapeRegExp;
function escapeRegExp(string) {
  return String(string).replace(/([.?*+^$[\]\\(){}-])/g, '\\$1');
}

utils.defaultApp = defaultApp;
function defaultApp(request) {
  var content = 'Not Found: ' + request.path;
  return {
    status: 404,
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(content)
    },
    content: content
  };
}

/**
 * Returns the best guess for a Content-Type to use for the given file.
 */
utils.mimeType = mimeType;
function mimeType(file) {
  return mime.lookup(file);
}

/**
 * Returns a text/plain 200 OK response.
 */
utils.ok = ok;
function ok() {
  return textResponse(200);
}

/**
 * Returns a text/plain 400 Bad Request response.
 */
utils.badRequest = badRequest;
function badRequest() {
  return textResponse(400);
}

/**
 * Returns a text/plain 401 Unauthorized response containing a single Basic
 * challenge for the given realm in a WWW-Authenticate header.
 */
utils.unauthorized = unauthorized;
function unauthorized(realm) {
  realm = realm || 'Authorization Required';
  return textResponse(401, { 'WWW-Authenticate': 'Basic realm="' + realm + '"' });
}

/**
 * Returns a text/plain 403 Forbidden response.
 */
utils.forbidden = forbidden;
function forbidden() {
  return textResponse(403);
}

/**
 * Returns a text/plain 404 Not Found response that optionally contains the
 * given debug info in the body.
 */
utils.notFound = notFound;
function notFound(debug) {
  return textResponse(404);
}

/**
 * Returns a text/plain 500 Server Error response.
 */
utils.serverError = serverError;
function serverError() {
  return textResponse(500);
}

function textResponse(status, headers, content) {
  content = content || STATUS_CODES[status];
  headers = headers || {};
  headers['Content-Type'] = 'text/plain';
  headers['Content-Length'] = Buffer.byteLength(content);
  return { status: status, headers: headers, content: content };
}

utils.parseQueryString = parseQueryString;
function parseQueryString(queryString) {
  return qs.parse(queryString);
}

utils.parseUrl = parseUrl;
function parseUrl(urlString) {
  return url.parse(urlString);
}
