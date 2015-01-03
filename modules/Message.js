var d = require('describe-property');
var Stream = require('bufferedstream');
var binaryTo = require('./utils/binaryTo');
var binaryFrom = require('./utils/binaryFrom');
var bufferStream = require('./utils/bufferStream');
var normalizeHeaderName = require('./utils/normalizeHeaderName');
var parseCookie = require('./utils/parseCookie');
var parseQuery = require('./utils/parseQuery');

/**
 * The default content to use for new messages.
 */
var DEFAULT_CONTENT = binaryFrom('');

/**
 * The default maximum length (in bytes) to use in Message#parseContent.
 */
var DEFAULT_MAX_CONTENT_LENGTH = Math.pow(2, 20); // 1M

/**
 * The default prefix to use for uploaded temporary files that are stored
 * on disk using Message#parseContent.
 */
var DEFAULT_UPLOAD_PREFIX = 'MachUpload-';

var HEADERS_LINE_SEPARATOR = /\r?\n/;
var HEADER_SEPARATOR = ': ';

/**
 * An HTTP message.
 */
function Message(content, headers) {
  this.headers = headers;
  this.content = content;
}

Object.defineProperties(Message.prototype, {

  /**
   * The headers of this message as { headerName, value }.
   */
  headers: d.gs(function () {
    return this._headers;
  }, function (value) {
    this._headers = {};

    if (typeof value === 'string') {
      value.split(HEADERS_LINE_SEPARATOR).forEach(function (line) {
        var index = line.indexOf(HEADER_SEPARATOR);

        if (index === -1) {
          this.addHeader(line, true);
        } else {
          this.addHeader(line.substring(0, index), line.substring(index + HEADER_SEPARATOR.length));
        }
      }, this);
    } else if (value != null) {
      for (var headerName in value)
        if (value.hasOwnProperty(headerName))
          this.addHeader(headerName, value[headerName]);
    }
  }),

  /**
   * Sets the value of a header.
   */
  setHeader: d(function (headerName, value) {
    this.headers[normalizeHeaderName(headerName)] = value;
  }),

  /**
   * Adds the value to the header with the given name.
   */
  addHeader: d(function (headerName, value) {
    headerName = normalizeHeaderName(headerName);

    var headers = this.headers;
    if (headerName in headers) {
      if (Array.isArray(headers[headerName])) {
        headers[headerName].push(value);
      } else {
        headers[headerName] = [ headers[headerName], value ];
      }
    } else {
      headers[headerName] = value;
    }
  }),

  /**
   * An object containing cookies in this message, keyed by name.
   */
  cookies: d.gs(function () {
    if (!this._cookies) {
      var header = this.headers['Cookie'];

      if (header) {
        var cookies = parseCookie(header);

        // From RFC 2109:
        // If multiple cookies satisfy the criteria above, they are ordered in
        // the Cookie header such that those with more specific Path attributes
        // precede those with less specific. Ordering with respect to other
        // attributes (e.g., Domain) is unspecified.
        for (var cookieName in cookies)
          if (Array.isArray(cookies[cookieName]))
            cookies[cookieName] = cookies[cookieName][0] || '';

        this._cookies = cookies;
      } else {
        this._cookies = {};
      }
    }

    return this._cookies;
  }),

  /**
   * Gets/sets the value of the Content-Type header.
   */
  contentType: d.gs(function () {
    return this.headers['Content-Type'];
  }, function (value) {
    this.headers['Content-Type'] = value;
  }),

  /**
   * The media type (type/subtype) portion of the Content-Type header without any
   * media type parameters. e.g. when Content-Type is "text/plain;charset=utf-8",
   * the mediaType is "text/plain".
   *
   * See http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.7
   */
  mediaType: d.gs(function () {
    var contentType = this.contentType;

    if (contentType)
      return contentType.split(/\s*[;,]\s*/)[0].toLowerCase();
  }, function (value) {
    this.contentType = value + (this.charset ? ';charset=' + this.charset : '');
  }),

  /**
   * Returns the character set used to encode the content of this message. e.g.
   * when Content-Type is "text/plain;charset=utf-8", charset is "utf-8".
   *
   * See http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.4
   */
  charset: d.gs(function () {
    var contentType = this.contentType, match;

    if (contentType && (match = contentType.match(/\bcharset=([\w-]+)/)))
      return match[1];
  }, function (value) {
    this.contentType = this.mediaType + (value ? ';charset=' + value : '');
  }),

  /**
   * The content of this message as a binary stream.
   */
  content: d.gs(function () {
    return this._content;
  }, function (value) {
    if (value == null)
      value = DEFAULT_CONTENT;

    if (value instanceof Stream) {
      this._content = value;
      value.pause();
    } else {
      this._content = new Stream(value);
    }

    delete this._bufferedContent;
  }),

  /**
   * True if the content of this message is buffered, false otherwise.
   */
  isBuffered: d.gs(function () {
    return this._bufferedContent != null;
  }),

  /**
   * Returns a binary representation of the content of this message up to
   * the given length. This is useful in applications that need to access the
   * entire message body at once, instead of as a stream.
   *
   * Note: 0 is a valid value for maxLength. It means "no limit".
   */
  bufferContent: d(function (maxLength) {
    if (this._bufferedContent == null)
      this._bufferedContent = bufferStream(this.content, maxLength);

    return this._bufferedContent;
  }),

  /**
   * Returns the content of this message up to the given length as a string
   * with the given encoding.
   *
   * Note: 0 is a valid value for maxLength. It means "no limit".
   */
  stringifyContent: d(function (maxLength, encoding) {
    encoding = encoding || this.charset;

    return this.bufferContent(maxLength).then(function (chunk) {
      return binaryTo(chunk, encoding);
    });
  }),

  /**
   * Returns a promise for an object of data contained in the content body.
   *
   * The maxLength argument specifies the maximum length (in bytes) that the
   * parser will accept. If the content stream exceeds the maximum length, the
   * promise is rejected with a MaxLengthExceededError. The appropriate response
   * to send to the client in this case is 413 Request Entity Too Large, but
   * many HTTP clients including most web browsers may not understand it.
   *
   * The uploadPrefix argument specifies a string to use to prefix file names
   * when using the default multipart handler to store uploaded files on disk.
   *
   * Note: 0 is a valid value for maxLength. It means "no limit".
   */
  parseContent: d(function (maxLength, uploadPrefix) {
    if (this._parsedContent)
      return this._parsedContent;

    if (typeof maxLength !== 'number') {
      uploadPrefix = maxLength;
      maxLength = DEFAULT_MAX_CONTENT_LENGTH;
    }

    if (typeof uploadPrefix !== 'string')
      uploadPrefix = DEFAULT_UPLOAD_PREFIX;

    this._parsedContent = this._parseContent(maxLength, uploadPrefix);

    return this._parsedContent;
  }),

  _parseContent: d(function (maxLength, uploadPrefix) {
    return this.stringifyContent(maxLength).then(
      this.mediaType === 'application/json' ? JSON.parse : parseQuery
    );
  })

});

module.exports = Message;
