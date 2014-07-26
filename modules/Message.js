var d = require('d');
var bops = require('bops');
var Stream = require('bufferedstream');
var MaxLengthExceededError = require('./errors/MaxLengthExceededError');
var bufferStream = require('./utils/bufferStream');
var getByteLength = require('./utils/getByteLength');
var normalizeHeaderName = require('./utils/normalizeHeaderName');
var parseMultipart = require('./utils/parseMultipart');
var parseQueryString = require('./utils/parseQueryString');
var streamPartToDisk = require('./utils/streamPartToDisk');

/**
 * The default content to use for new messages.
 */
var DEFAULT_CONTENT = bops.from('');

/**
 * The default maximum length (in bytes) to use in Message#parseContent.
 */
var DEFAULT_MAX_CONTENT_LENGTH = Math.pow(2, 20); // 1m

/**
 * The default prefix to use for uploaded temporary files that are stored
 * on disk using Message#parseContent.
 */
var DEFAULT_UPLOAD_PREFIX = 'MachUpload-';

/**
 * An HTTP message. The base class for Request and Response.
 */
function Message(content, headers) {
  this._headers = {};

  if (headers)
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
    if (value == null) {
      this._headers = {};
    } else {
      for (var headerName in value) {
        if (value.hasOwnProperty(headerName))
          this.setHeader(headerName, value[headerName]);
      }
    }
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
   * Sets the value of a header.
   */
  setHeader: d(function (headerName, value) {
    this.headers[normalizeHeaderName(headerName)] = value;
  }),

  /**
   * The content of this message as a binary stream.
   */
  content: d.gs(function () {
    return this._content;
  }, function (value) {
    value = value || DEFAULT_CONTENT;

    if (value instanceof Stream) {
      this._content = value;
    } else {
      this._content = new Stream(value);

      if (bops.is(value)) {
        this.headers['Content-Length'] = getByteLength(value);
      } else if (value.length != null) {
        this.headers['Content-Length'] = value.length;
      }
    }

    this._content.pause();
  }),

  /**
   * The value of the Content-Type header.
   */
  contentType: d.gs(function () {
    return this.headers['Content-Type'];
  }),

  /**
   * The media type (type/subtype) portion of the Content-Type header without any
   * media type parameters. e.g., when Content-Type is "text/plain;charset=utf-8",
   * the mediaType is "text/plain".
   *
   * See http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.7
   */
  mediaType: d.gs(function () {
    var contentType = this.contentType;

    if (contentType)
      return contentType.split(/\s*[;,]\s*/)[0].toLowerCase();
  }),

  /**
   * A Date object representing the value of the Date header.
   */
  date: d.gs(function () {
    if (this.headers['Date'])
      return Date.parse(this.headers['Date']);
  }),

  /**
   * True if this message is multipart, false otherwise.
   */
  isMultipart: d.gs(function () {
    return this.multipartBoundary != null;
  }),

  /**
   * The value that was used as the boundary for multipart content.
   */
  multipartBoundary: d.gs(function () {
    var contentType = this.contentType;

    if (contentType) {
      var match = contentType.match(/^multipart\/.*boundary=(?:"([^"]+)"|([^;]+))/im);
      return match && (match[1] || match[2]);
    }
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
    if (!this._bufferedContent)
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
    return this.bufferContent(maxLength).then(function (chunk) {
      return bops.to(chunk, encoding);
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

    if (this.mediaType === 'application/json') {
      this._parsedContent = this.stringifyContent(maxLength).then(JSON.parse);
    } else if (this.isMultipart) {
      this._parsedContent = parseMultipartMessage(this, maxLength, uploadPrefix);
    } else { // Assume content is URL-encoded.
      this._parsedContent = this.stringifyContent(maxLength).then(parseQueryString);
    }

    return this._parsedContent;
  }),

  /**
   * A low-level hook responsible for handling multipart.Part objects when
   * parsing multipart message content. It should return the value to use for
   * that part in the parameters hash, or a promise for the value. By default
   * it streams file uploads to temporary files on disk and converts all other
   * message parameters to strings.
   *
   * This should be overridden if you want to specify some kind of custom handling
   * for multipart data, such as streaming it directly to a network file storage.
   */
  handlePart: d(function (part, uploadPrefix) {
    if (part.isFile)
      return streamPartToDisk(part, uploadPrefix);

    return bufferStream(part.content).then(bops.to);
  })

});

function parseMultipartMessage(message, maxLength, uploadPrefix) {
  function partHandler(part) {
    return message.handlePart(part, uploadPrefix);
  }

  // If the content has been buffered, use the buffer.
  if (message.isBuffered) {
    return message.bufferContent().then(function (content) {
      return parseMultipart(content, message.multipartBoundary, maxLength, partHandler);
    });
  }

  return parseMultipart(message.content, message.multipartBoundary, maxLength, partHandler);
}

module.exports = Message;
