var d = require('d');
var parseContentType = require('./utils/parseContentType');

/**
 * Represents an HTTP Content-Type header
 *
 * http://www.w3.org/Protocols/rfc1341/4_Content-Type.html
 */
function ContentType(headerValue) {
  var pojo = headerValue
    ? parseContentType(headerValue)
    : {};

  this._mediaType = pojo.mediaType || 'text/html';
  this._charset = pojo.charset || 'utf-8';
}

Object.defineProperties(ContentType.prototype, {

  /**
   * Returns the value of this header as a string.
   */
  value: d.gs(function () {
    return [this._mediaType, this._charset].join('; ');
  }),

  /**
   * Gets/sets the media type value of the Content-Type header.
   */
  mediaType: d.gs(function () {
    return this._mediaType;
  }, function (value) {
    this._mediaType = value;
  }),

  /**
   * Gets/sets the charset value of the Content-Type header.
   */
  charset: d.gs(function () {
    return this._charset;
  }, function (value) {
    this._charset = value;
  }),

  toString: d(function () {
    return 'Content-Type: ' + this.value;
  })

});

module.exports = ContentType;
