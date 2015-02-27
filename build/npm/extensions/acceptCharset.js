"use strict";

var d = require("describe-property");
var AcceptCharset = require("../headers/AcceptCharset");

module.exports = function (mach) {
  Object.defineProperties(mach.Connection.prototype, {

    /**
     * Returns true if the request indicates that the client accepts
     * the given character set.
     */
    acceptsCharset: d(function (charset) {
      return this.request.acceptsCharset(charset);
    })

  });

  Object.defineProperties(mach.Message.prototype, {

    /**
     * Returns true if the client accepts the given character set.
     */
    acceptsCharset: d(function (charset) {
      if (!this._acceptCharsetHeader) this._acceptCharsetHeader = new AcceptCharset(this.headers["Accept-Charset"]);

      return this._acceptCharsetHeader.accepts(charset);
    })

  });
};