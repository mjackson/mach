"use strict";

var d = require("describe-property");
var AcceptEncoding = require("../headers/AcceptEncoding");

module.exports = function (mach) {
  Object.defineProperties(mach.Connection.prototype, {

    /**
     * Returns true if the request indicates that the client accepts
     * the given content encoding.
     */
    acceptsEncoding: d(function (encoding) {
      return this.request.acceptsEncoding(encoding);
    })

  });

  Object.defineProperties(mach.Message.prototype, {

    /**
     * Returns true if the client accepts the given content encoding.
     */
    acceptsEncoding: d(function (encoding) {
      if (!this._acceptEncodingHeader) this._acceptEncodingHeader = new AcceptEncoding(this.headers["Accept-Encoding"]);

      return this._acceptEncodingHeader.accepts(encoding);
    })

  });
};