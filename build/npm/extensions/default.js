"use strict";

/**
 * The default extension for node.js environments.
 */
module.exports = function (mach) {
  mach.extend(require("./accept"), require("./acceptCharset"), require("./acceptEncoding"), require("./acceptLanguage"), require("./client"), require("./middleware"), require("./multipart"), require("./proxy"), require("./server"), require("./statusText"));
};