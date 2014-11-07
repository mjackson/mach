var d = require('d');

var ConnectionProperties = {

  /**
   * Returns true if the request indicates that the client accepts
   *  the given media type.
   */
  accepts: d(function (mediaType) {
    return this.request.accepts(mediaType);
  }),

  /**
   * Returns true if the request indicates that the client accepts
   * the given character set.
   */
  acceptsCharset: d(function (charset) {
    return this.request.acceptsCharset(charset);
  }),

  /**
   * Returns true if the request indicates that the client accepts
   * the given content encoding.
   */
  acceptsEncoding: d(function (encoding) {
    return this.request.acceptsEncoding(encoding);
  }),

  /**
   * Returns true if the request indicates that the client accepts
   * the given content language.
   */
  acceptsLanguage: d(function (language) {
    return this.request.acceptsLanguage(language);
  })

};

module.exports = ConnectionProperties;
