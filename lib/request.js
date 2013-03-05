var qs = require('querystring');
var Stream = require('stream');
var BufferedStream = require('bufferedstream');
var q = require('q');
var utils = require('./utils');
var errors = require('./errors');
var multipart = require('./multipart');

module.exports = Request;

/**
 * A Request is created for each new request received by the server. It serves
 * as the concurrency primitive for the duration of the request handling process.
 *
 * The `options` may contain any of the following:
 *
 *   - protocol         The protocol being used (i.e. "http:" or "https:")
 *   - protocolVersion  The protocol version
 *   - method           The request method (e.g. "GET" or "POST")
 *   - remoteHost       The IP address of the client
 *   - remotePort       The port number being used on the client machine
 *   - serverName       The host name of the server
 *   - serverPort       The port the server is listening on
 *   - queryString      The query string used in the request
 *   - scriptName       The virtual location of the application on the server
 *   - pathInfo/path    The path used in the request
 *   - date             The time the request was received as a Date
 *   - headers          An object of HTTP headers and values. Note: All header
 *                      names are lowercased for consistency
 *   - content          A readable stream for the body of the request
 *   - error            A writable stream for error messages
 */
function Request(options) {
  if (!(this instanceof Request)) return new Request(options);

  // If options is a string it specifies a URL.
  if (typeof options === 'string') {
    var parsedUrl = utils.parseUrl(options);
    options = {
      protocol: parsedUrl.protocol,
      serverName: parsedUrl.hostname,
      serverPort: parsedUrl.port,
      pathInfo: parsedUrl.pathname,
      queryString: parsedUrl.query
    };
  }

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
  this.maxContentLength = options.maxContentLength || Request.maxContentLength;

  // Make sure pathInfo is at least '/'.
  if (this.scriptName === '' && this.pathInfo === '') this.pathInfo = '/';

  this.headers = {};
  if (options.headers) {
    for (var headerName in options.headers) {
      this.headers[headerName.toLowerCase()] = options.headers[headerName];
    }
  }

  var content;
  if (options.params) {
    var encodedParams = utils.stringifyQueryString(options.params);

    if (this.method === 'POST' || this.method === 'PUT') {
      this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      content = encodedParams;
    } else {
      this.queryString = encodedParams;
      content = '';
    }
  } else {
    content = options.content || '';
  }

  // Buffer the input stream up to the maximum buffer size and pause it so
  // we don't miss data listeners that are registered in future ticks.
  this.content = new BufferedStream(Request.maxInputBufferSize, content);
  this.content.pause();

  if (options.error) {
    if (options.error instanceof Stream) {
      this.error = options.error;
    } else {
      throw new Error('Request error must be a Stream');
    }
  } else {
    this.error = process.stderr;
  }
}

/**
 * The prefix to use for temporary files created by the default
 * file upload handler.
 */
Request.uploadPrefix = 'MachUpload-';

/**
 * The default maximum size in bytes for the content (body) of a request. Set
 * to 0 to disable.
 */
Request.maxContentLength = Math.pow(2, 20); // 1m

/**
 * The maximum size of the input buffer for request bodies.
 */
Request.maxInputBufferSize = Math.pow(2, 16); // 65k

/**
 * The maximum size of the output buffer for response bodies.
 */
Request.maxOutputBufferSize = Math.pow(2, 16); // 65k

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

    if (typeof response === 'object') {
      if (Array.isArray(response)) {
        response = {
          status: response[0],
          headers: response[1],
          content: response[2],
        };
      }
    } else if (typeof response === 'string') {
      response = { content: response };
    } else if (typeof response === 'number') {
      response = { status: response };
    }

    response.status = response.status || 200;
    response.headers = response.headers || {};
    response.content = response.content || '';

    if (typeof response.content === 'string') {
      response.headers['Content-Length'] = Buffer.byteLength(response.content);
      response.content = new BufferedStream(Request.maxOutputBufferSize, response.content);
    }

    response.content.pause();

    return response;
  });
};

Request.prototype.done = function () {
  // Since we pause the content stream on the way in we need to make sure it
  // has a chance to emit all its data. Otherwise node's event loop will wait
  // indefinitely for it to finish emitting data.
  // See https://github.com/mjijackson/bufferedstream/pull/3#issuecomment-9203538
  this.content.removeAllListeners();
  this.content.resume();
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
 */
Request.prototype.parseContent = function () {
  if (!this._parsedContent) {
    if (!this.canParseContent) {
      this._parsedContent = q.resolve({});
    } else if (this.mediaType === 'application/json') {
      this._parsedContent = bufferContent(this).then(function (buffer) {
        return JSON.parse(buffer.toString());
      });
    } else {
      var contentType = this.headers['content-type'] || '';
      var match = contentType.match(/^multipart\/.*boundary=(?:"([^"]+)"|([^;]+))/im);

      if (!match) {
        this._parsedContent = bufferContent(this).then(function (buffer) {
          return qs.parse(buffer.toString());
        });
      } else {
        var content = this.content;
        var boundary = match[1] || match[2];
        var parser = new multipart.Parser(boundary, this.uploadPrefix);

        var deferred = q.defer();

        var params = {};
        parser.onParam = function (name, value) {
          params[name] = value;
        };

        parser.onEnd = function () {
          deferred.resolve(params);
        };

        // Throttle the content stream based on how quickly we can write to disk.
        parser.onFile = function (file) {
          file.on('write', function () {
            content.pause();
          });

          file.on('progress', function () {
            content.resume();
          });
        };

        var maxLength = this.maxContentLength;
        var contentLength = 0;

        content.on('data', function (buffer) {
          if (maxLength && (contentLength + buffer.length) > maxLength) {
            content.pause();
            deferred.reject(utils.requestEntityTooLarge());
          } else {
            var length = parser.write(buffer);
            if (length !== buffer.length) {
              content.pause();
              deferred.reject(new Error('Error parsing multipart body: ' + length + ' of ' + buffer.length + ' bytes parsed'));
            }
          }
        });

        content.on('end', function () {
          try {
            parser.end();
          } catch (e) {
            deferred.reject(new Error('Error parsing multipart body'));
          }
        });

        content.resume();

        this._parsedContent = deferred.promise;
      }
    }
  }

  return this._parsedContent;
};

function bufferContent(request) {
  return utils.bufferStream(request.content, request.maxContentLength).fail(function (error) {
    if (error instanceof errors.MaxLengthExceededError) {
      throw utils.requestEntityTooLarge();
    }

    throw error;
  });
}
