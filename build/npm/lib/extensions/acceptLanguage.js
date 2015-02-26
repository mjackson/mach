"use strict";

var d = require("describe-property");
var AcceptLanguage = require("../headers/AcceptLanguage");

module.exports = function (mach) {
  Object.defineProperties(mach.Connection.prototype, {

    /**
     * Returns true if the request indicates that the client accepts
     * the given content language.
     */
    acceptsLanguage: d(function (language) {
      return this.request.acceptsLanguage(language);
    })

  });

  Object.defineProperties(mach.Message.prototype, {

    /**
     * Returns true if the client accepts the given content language.
     */
    acceptsLanguage: d(function (language) {
      if (!this._acceptLanguageHeader) this._acceptLanguageHeader = new AcceptLanguage(this.headers["Accept-Language"]);

      return this._acceptLanguageHeader.accepts(language);
    })

  });
};