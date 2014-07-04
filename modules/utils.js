var util = require('util');
var crypto = require('crypto');
var path = require('path');
var fs = require('fs');
var qs = require('qs');
var url = require('url');
var Promise = require('bluebird');
var mime = require('mime');
var errors = require('./errors');

exports.stringifyError = function (error) {
  if (error) {
    if (typeof error.stack === 'string')
      return error.stack;

    if (typeof error === 'string')
      return error;
  }

  // This is some other object posing as an Error.
  return 'Error: ' + util.inspect(error);
};

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

exports.STATUS_WITHOUT_CONTENT = {
  100: true,
  101: true,
  204: true,
  304: true
};

exports.statusHasContent = function (status) {
  return exports.STATUS_WITHOUT_CONTENT[status] !== true;
};

exports.SAFE_REQUEST_METHODS = {
  GET: true,
  HEAD: true,
  OPTIONS: true,
  TRACE: true
};

exports.isSafeRequestMethod = function (method) {
  return exports.SAFE_REQUEST_METHODS[method.toUpperCase()] === true;
};

exports.isApp = function (object) {
  return object && (typeof object === 'function' || typeof object.apply === 'function');
};

exports.defaultApp = function (request) {
  return textResponse(404, 'Not Found: ' + request.method + ' ' + request.path);
};

var _slice = Array.prototype.slice;
exports.slice = function (object) {
  return _slice.apply(object, _slice.call(arguments, 1));
};

exports.isRegExp = util.isRegExp;

exports.escapeRegExp = function (string) {
  return String(string).replace(/([.?*+^$[\]\\(){}-])/g, '\\$1');
};

exports.mimeType = function (file) {
  return mime.lookup(file);
};

exports.parseQueryString = function (string) {
  return qs.parse(string);
};

exports.parseUrl = function (string) {
  return url.parse(string);
};

exports.encodeBase64 = function (string) {
  return new Buffer(string, arguments[1]).toString('base64');
};

exports.decodeBase64 = function (string) {
  return new Buffer(string, 'base64').toString();
};

exports.makeCookie = function (name, options) {
  options = options || {};

  if (typeof options === 'string')
    options = { value: options };

  var cookie = encodeURIComponent(name) + '=' + encodeURIComponent(options.value || '');

  if (options.domain)   cookie += '; domain=' + options.domain;
  if (options.path)     cookie += '; path=' + options.path;
  if (options.expires)  cookie += '; expires=' + options.expires.toUTCString();
  if (options.secure)   cookie += '; secure';
  if (options.httpOnly) cookie += '; HttpOnly';

  return cookie;
};

exports.parseCookie = function (cookie) {
  return require('querystring').parse(cookie, /[;,] */);
};

exports.setCookie = function (headers, name, options) {
  var cookie = exports.makeCookie(name, options);

  if (headers['Set-Cookie']) {
    headers['Set-Cookie'] = [ headers['Set-Cookie'], cookie ].join('\n');
  } else {
    headers['Set-Cookie'] = cookie;
  }
};

/**
 * Compiles the given route string into a RegExp that can be used to match
 * it. The route may contain named keys in the form of a colon followed by a
 * valid JavaScript identifier (e.g. ":name", ":_name", or ":$name" are all
 * valid keys). If the route contains the special "*" symbol, it is substituted
 * with a "(.*?)" pattern in the resulting RegExp.
 */
exports.compileRoute = function (route) {
  var pattern = route.replace(/((:[a-z_$][a-z0-9_$]*)|[*.+()])/ig, function (match) {
    switch (match) {
    case '*':
      return '(.*?)';
    case '.':
    case '+':
    case '(':
    case ')':
      return exports.escapeRegExp(match);
    }

    return '([^./?#]+)';
  });

  return new RegExp('^' + pattern + '$', 'i');
};

/**
 * Returns a cryptographically-secure string containing the given number
 * of bytes.
 */
exports.makeToken = function (byteLength) {
  return crypto.randomBytes(byteLength).toString('hex');
};

/**
 * Returns a SHA1 hash of the given string.
 */
exports.makeHash = function (string) {
  return crypto.createHash('sha1').update(string).digest('hex');
};

/**
 * Returns a promise for the MD5 checksum of all data in the given file.
 */
exports.makeChecksum = function (file) {
  return new Promise(function (resolve, reject) {
    var hash = crypto.createHash('md5');
    var stream = fs.createReadStream(file);

    stream.on('error', reject);

    stream.on('data', function (chunk) {
      hash.update(chunk);
    });

    stream.on('end', function () {
      resolve(hash.digest('hex'));
    });
  });
};

/**
 * Returns a promise for a buffer of all content in the given stream up to
 * the given maximum length.
 */
exports.bufferStream = function (stream, maxLength) {
  return new Promise(function (resolve, reject) {
    if (!stream.readable) {
      reject(new Error('Cannot buffer stream that is not readable'));
    } else {
      var chunks = [];
      var length = 0;

      stream.on('error', reject);

      stream.on('data', function (chunk) {
        length += chunk.length;

        if (maxLength && length > maxLength) {
          reject(new errors.MaxLengthExceededError(maxLength));
        } else {
          chunks.push(chunk);
        }
      });

      stream.on('end', function () {
        resolve(Buffer.concat(chunks));
      });
    }
  });
};

exports.streamToDisk = function (part, filePrefix) {
  var temporaryPath = makeTemporaryPath(filePrefix);
  var info = {
    path: temporaryPath,
    name: part.filename,
    type: part.type,
    size: 0
  };

  var stream = fs.createWriteStream(info.path);

  return new Promise(function (resolve, reject) {
    part.content.on('data', function (chunk) {
      info.size += chunk.length;
      stream.write(chunk);
    });

    part.content.on('end', function () {
      stream.end(function () {
        resolve(info);
      });
    });
  });
};

var os = require('os');

function makeTemporaryPath(prefix) {
  prefix = prefix || '';

  var random = (Math.random() * 0x100000000 + 1).toString(36);
  var now = new Date();
  var date = '' + now.getYear() + now.getMonth() + now.getDate();
  var name = [ prefix, date, '-', process.pid, '-', random ].join('');

  return path.join(os.tmpDir(), name);
}

/**
 * Returns a text/plain 200 OK response.
 */
exports.ok = makeTextResponder(200);

/**
 * Returns a text/plain 400 Bad Request response.
 */
exports.badRequest = makeTextResponder(400);

/**
 * Returns a text/plain 403 Forbidden response.
 */
exports.forbidden = makeTextResponder(403);

/**
 * Returns a text/plain 404 Not Found response.
 */
exports.notFound = makeTextResponder(404);

/**
 * Returns a text/plain 413 Request Entity Too Large response.
 */
exports.requestEntityTooLarge = makeTextResponder(413);

/**
 * Returns a text/plain 500 Internal Server Error response.
 */
exports.internalServerError = makeTextResponder(500);

function textResponse(status, content) {
  content = content || exports.STATUS_CODES[status];

  return {
    status: status,
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(content)
    },
    content: content
  };
}

function makeTextResponder(status) {
  return function (content) {
    return textResponse(status, content);
  };
}
