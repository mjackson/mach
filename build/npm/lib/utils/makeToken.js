"use strict";

var crypto = require("crypto");

/**
 * Returns a cryptographically-secure string containing the
 * given number of bytes.
 */
function makeToken(byteLength) {
  return crypto.randomBytes(byteLength).toString("hex");
}

module.exports = makeToken;