var qs = require('querystring');
var Stream = require('stream');
var Readable = Stream.Readable;
var q = require('q');
var utils = require('./utils');
var errors = require('./errors');
var multipart = require('./multipart');

var NO_CONTENT = new Buffer(0);

module.exports = Request;

/**
 * A Request is created for each new request received by the server. It serves
 * as the concurrency primitive for the duration of the request handling process.
 *
 * The `options` may contain any of the following:
 *
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
 *   - date               The time the request was received as a Date
 *   - uploadPrefix       The prefix to use for the names of uploaded temp
 *                        files. Defaults to Request.uploadPrefix.
 *   - headers            An object of HTTP headers and values. Note: All header
 *                        names are lowercased for consistency
 *   - content            A readable stream for the body of the request
 *   - error              A writable stream for error messages
 */
function Request(options) {
  options = options || {};

  this._protocol = options.protocol || 'http:';
  this.protocolVersion = options.protocolVersion || '1.0';
  this.method = (options.method || 'GET').toUpperCase();
  this._remoteHost = options.remoteHost || '';
  this.remotePort = parseInt(options.remotePort, 10) || 0;
  this.serverName = options.serverName || '';
  this.serverPort = parseInt(options.serverPort, 10) || 0;
  this.queryString = options.queryString || '';
  this.scriptName = options.scriptName || '';
  this.pathInfo = options.pathInfo || options.path || '';
  this.date = options.date || new Date;
  this.uploadPrefix = options.uploadPrefix || Request.uploadPrefix;

  // Make sure pathInfo is at least '/'.
  if (this.scriptName === '' && this.pathInfo === '') this.pathInfo = '/';

  this.headers = {};
  if (options.headers) {
    for (var headerName in options.headers) {
      this.headers[headerName.toLowerCase()] = options.headers[headerName];
    }
  }

  if (options.error) {
    if (options.error instanceof Stream && options.error.writable) {
      this.error = options.error;
    } else {
      throw new Error('Error must be a writable Stream');
    }
  } else {
    this.error = process.stderr;
  }

  if (options.content) {
    if (options.content instanceof Readable) {
      this.content = options.content;
    } else {
      this.content = makeReadable(options.content);
    }
  } else {
    this.content = makeReadable(NO_CONTENT);
  }
}

/**
 * The prefix to use for temporary files created by the default
 * file upload handler.
 */
Request.uploadPrefix = 'MachUpload-';

/**
 * The default maximum length (in bytes) to use in Request#parseContent.
 */
Request.maxContentLength = Math.pow(2, 20); // 1m

/**
 * The set of form-data media types. Requests that indicate one of these media
 * types were most likely made using an HTML form.
 */
Request.formMediaTypes = [
  'application/x-www-form-urlencoded',
  'multipart/form-data'
];

/**
 * The set of media types we are able to parse.
 */
Request.parseMediaTypes = Request.formMediaTypes.concat([
  'multipart/related',
  'multipart/mixed',
  'application/json'
]);

/**
 * Calls the given `app` with this request as the only argument. Always returns
 * a promise for a response object with three properties: `status`, `headers`,
 * and `content`.
 *
 * Note: The `content` will always be a *paused* readable Stream of data.
 */
Request.prototype.call = function (app) {
  try {
    var value = app(this);
  } catch (error) {
    return q.reject(error);
  }

  return q.when(value, function (response) {
    if (response == null) {
      throw new Error('No response returned from app: ' + app);
    }

    // Support returning strings, Buffers, and numbers for convenience.
    var type = typeof response;
    if (type === 'string' || Buffer.isBuffer(response)) {
      response = { content: response };
    } else if (type === 'number') {
      response = { status: response };
    } else if (type !== 'object') {
      throw new Error('Invalid response type "' + type + '" returned from app: ' + app);
    }

    response.status = response.status || 200;
    response.headers = response.headers || {};
    response.content = response.content || NO_CONTENT;

    if (!(response.content instanceof Readable)) {
      var content = makeReadable(response.content);
      response.content = content;
      response.headers['Content-Length'] = content.length;
    }

    return response;
  });
};

/**
 * The protocol used in the request (i.e. "http:" or "https:").
 */
Request.prototype.__defineGetter__('protocol', function () {
  if (this.headers['x-forwarded-ssl'] === 'on') {
    return 'https:';
  }

  if (this.headers['x-forwarded-proto']) {
    return this.headers['x-forwarded-proto'].split(',')[0] + ':';
  }

  return this._protocol;
});

/**
 * True if this request was made over SSL.
 */
Request.prototype.__defineGetter__('isSsl', function () {
  return this.protocol === 'https:';
});

/**
 * True if this request was made using XMLHttpRequest.
 */
Request.prototype.__defineGetter__('isXhr', function () {
  return this.headers['x-requested-with'] === 'XMLHttpRequest';
});

/**
 * The IP address of the client.
 */
Request.prototype.__defineGetter__('remoteHost', function () {
  return this.headers['x-forwarded-for'] || this._remoteHost;
});

/**
 * Returns a string of the hostname:port used in this request.
 */
Request.prototype.__defineGetter__('hostWithPort', function () {
  var forwarded = this.headers['x-forwarded-host'];

  if (forwarded) {
    var parts = forwarded.split(/,\s?/);
    return parts[parts.length - 1];
  }

  if (this.headers.host) {
    return this.headers.host;
  }

  if (this.serverPort) {
    return this.serverName + ':' + this.serverPort;
  }

  return this.serverName;
});

/**
 * Returns the name of the host used in this request.
 */
Request.prototype.__defineGetter__('host', function () {
  return this.hostWithPort.replace(/:\d+$/, '');
});

/**
 * Returns the port number used in this request.
 */
Request.prototype.__defineGetter__('port', function () {
  var port = this.hostWithPort.split(':')[1] || this.headers['x-forwarded-port'];
  if (port) return parseInt(port, 10);
  if (this.isSsl) return 443;
  if (this.headers['x-forwarded-host']) return 80;
  return this.serverPort;
});

/**
 * Returns a URL containing the protocol, hostname, and port of the original
 * request.
 */
Request.prototype.__defineGetter__('baseUrl', function () {
  var protocol = this.protocol;
  var base = protocol + '//' + this.host;
  var port = this.port;

  if ((protocol === 'https:' && port !== 443) || (protocol === 'http:' && port !== 80)) {
    base += ':' + port;
  }

  return base;
});

/**
 * The path of this request, without the query string.
 */
Request.prototype.__defineGetter__('path', function () {
  return this.scriptName + this.pathInfo;
});

/**
 * The path of this request, including the query string.
 */
Request.prototype.__defineGetter__('fullPath', function () {
  return this.path + (this.queryString ? '?' + this.queryString : '');
});

/**
 * The original URL of this request.
 */
Request.prototype.__defineGetter__('url', function () {
  return this.baseUrl + this.fullPath;
});

/**
 * An object containing the properties and values that were URL-encoded in
 * the query string.
 */
Request.prototype.__defineGetter__('query', function () {
  if (!this._query) {
    this._query = utils.parseQueryString(this.queryString);
  }

  return this._query;
});

/**
 * An object containing cookies that were used in the request, keyed by name.
 */
Request.prototype.__defineGetter__('cookies', function () {
  if (!this._cookies) {
    if (this.headers.cookie) {
      var cookies = utils.parseQueryString(this.headers.cookie, /[;,] */);

      // From RFC 2109:
      // If multiple cookies satisfy the criteria above, they are ordered in
      // the Cookie header such that those with more specific Path attributes
      // precede those with less specific. Ordering with respect to other
      // attributes (e.g., Domain) is unspecified.
      for (var cookieName in cookies) {
        if (Array.isArray(cookies[cookieName])) {
          cookies[cookieName] = cookies[cookieName][0] || '';
        }
      }

      this._cookies = cookies;
    } else {
      this._cookies = {};
    }
  }

  return this._cookies;
});

/**
 * The media type (type/subtype) portion of the Content-Type header without any
 * media type parameters. e.g., when Content-Type is "text/plain;charset=utf-8",
 * the mediaType is "text/plain".
 *
 * See http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.7
 */
Request.prototype.__defineGetter__('mediaType', function () {
  var contentType = this.headers['content-type'];
  return contentType && contentType.split(/\s*[;,]\s*/)[0].toLowerCase();
});

/**
 * True if this request was probably made using an HTML form, false otherwise.
 */
Request.prototype.__defineGetter__('isForm', function () {
  var mediaType = this.mediaType;

  if (Request.formMediaTypes.indexOf(mediaType) !== -1) {
    return true;
  }

  return (!mediaType && this.method === 'POST');
});

/**
 * True if we are probably able to parse the content of this request, false
 * otherwise.
 */
Request.prototype.__defineGetter__('canParseContent', function () {
  return (Request.parseMediaTypes.indexOf(this.mediaType) !== -1) || this.isForm;
});

/**
 * Returns a promise for an object of data contained in the request body. If
 * the request is not able to be parsed (see Request#canParseContent) this will
 * be an empty object.
 *
 * The maxLength arguments specifies the maximum length (in bytes) that the
 * parser will accept. It defaults to the value of Request.maxContentLength.
 * If the content stream exceeds the maximum length, the promise is rejected
 * with a mach.errors.MaxLengthExceededError. The appropriate response to
 * send to the client in this situation would be 413 Request Entity Too Large,
 * but many HTTP clients including most web browsers may not understand it.
 *
 * Note: 0 is a valid value for maxLength. It means "no limit".
 */
Request.prototype.parseContent = function (maxLength) {
  if (this._parsedContent) return this._parsedContent;
  if (maxLength == null) maxLength = Request.maxContentLength;

  var content = this.content;

  if (!this.canParseContent) {
    this._parsedContent = q({});
  } else if (this.mediaType === 'application/json') {
    this._parsedContent = utils.bufferStream(content, maxLength).then(function (buffer) {
      return JSON.parse(buffer.toString());
    });
  } else {
    var contentType = this.headers['content-type'] || '';
    var match = contentType.match(/^multipart\/.*boundary=(?:"([^"]+)"|([^;]+))/im);

    if (!match) {
      this._parsedContent = utils.bufferStream(content, maxLength).then(function (buffer) {
        return qs.parse(buffer.toString());
      });
    } else {
      var value = q.defer();
      var params = {};

      var boundary = match[1] || match[2];
      var parser = new multipart.Parser(boundary, this.uploadPrefix);
      parser.onParam = function (name, value) {
        params[name] = value;
      };

      parser.onEnd = function () {
        value.resolve(params);
      };

      var length = 0;

      function onReadable() {
        var chunk = content.read();
        length += chunk.length;

        if (maxLength && length > maxLength) {
          cleanupListeners();
          value.reject(new errors.MaxLengthExceededError(maxLength));
        } else {
          var parsedLength = parser.write(chunk);
          if (parsedLength !== chunk.length) {
            cleanupListeners();
            value.reject(new Error('Error parsing multipart body: ' + parsedLength + ' of ' + chunk.length + ' bytes parsed'));
          }
        }
      }

      function onError(error) {
        cleanupListeners();
        value.reject(error);
      }

      function onEnd() {
        cleanupListeners();

        try {
          parser.end();
        } catch (error) {
          value.reject(new Error('Error parsing multipart body: ' + error.message));
        }
      }

      function cleanupListeners() {
        content.removeListener('readable', onReadable);
        content.removeListener('error', onError);
        content.removeListener('end', onEnd);
      }

      content.addListener('readable', onReadable);
      content.addListener('error', onError);
      content.addListener('end', onEnd);

      this._parsedContent = value.promise;
    }
  }

  return this._parsedContent;
};

function makeReadable(content) {
  if (typeof content === 'string') {
    content = new Buffer(content, arguments[1]);
  }

  if (!Buffer.isBuffer(content)) {
    throw new Error('Content must be Buffer or string');
  }

  var stream = new Readable;
  stream.length = content.length;
  stream._read = function (size) {
    stream.push(content);
    stream.push(null);
    content = null;
  };

  return stream;
}
