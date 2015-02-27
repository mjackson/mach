"use strict";

var MimeTypes = require("../MimeTypes");
var ExtTypes = {};

Object.keys(MimeTypes).forEach(function (type) {
  MimeTypes[type].forEach(function (ext) {
    ExtTypes[ext] = type;
  });
});

var DEFAULT_TYPE = "application/octet-stream";
var EXT_MATCHER = /\.(\w+)$/;

function getMimeType(file, defaultType) {
  var match = file.match(EXT_MATCHER);
  return match && ExtTypes[match[1]] || defaultType || DEFAULT_TYPE;
}

module.exports = getMimeType;