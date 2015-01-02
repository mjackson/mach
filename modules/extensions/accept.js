var d = require('describe-property');
var Accept = require('../headers/Accept');
var AcceptCharset = require('../headers/AcceptCharset');
var AcceptEncoding = require('../headers/AcceptEncoding');
var AcceptLanguage = require('../headers/AcceptLanguage');

module.exports = function (mach) {
  Object.defineProperties(mach.Message.prototype, {

    /**
     * Returns true if the client accepts the given media type.
     */
    accepts: d(function (mediaType) {
      if (!this._acceptHeader)
        this._acceptHeader = new Accept(this.headers['Accept']);

      return this._acceptHeader.accepts(mediaType);
    }),

    /**
     * Returns true if the client accepts the given character set.
     */
    acceptsCharset: d(function (charset) {
      if (!this._acceptCharsetHeader)
        this._acceptCharsetHeader = new AcceptCharset(this.headers['Accept-Charset']);

      return this._acceptCharsetHeader.accepts(charset);
    }),

    /**
     * Returns true if the client accepts the given content encoding.
     */
    acceptsEncoding: d(function (encoding) {
      if (!this._acceptEncodingHeader)
        this._acceptEncodingHeader = new AcceptEncoding(this.headers['Accept-Encoding']);

      return this._acceptEncodingHeader.accepts(encoding);
    }),

    /**
     * Returns true if the client accepts the given content language.
     */
    acceptsLanguage: d(function (language) {
      if (!this._acceptLanguageHeader)
        this._acceptLanguageHeader = new AcceptLanguage(this.headers['Accept-Language']);

      return this._acceptLanguageHeader.accepts(language);
    })

  });

  Object.defineProperties(mach.Connection.prototype, {

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

  });
};
