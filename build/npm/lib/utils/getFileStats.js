"use strict";

var fs = require("fs");
var Promise = require("./Promise");

/**
 * Returns stats for the given file or null if it doesn't exist.
 */
function getFileStats(path) {
  return new Promise(function (resolve, reject) {
    fs.stat(path, function (error, stats) {
      if (error && error.code !== "ENOENT") {
        reject(error);
      } else {
        resolve(stats || null);
      }
    });
  });
}

module.exports = getFileStats;