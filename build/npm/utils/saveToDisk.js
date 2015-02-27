"use strict";

var fs = require("fs");
var File = require("./File");
var Promise = require("./Promise");
var makeTemporaryPath = require("./makeTemporaryPath");

function saveToDisk(message, filePrefix) {
  return new Promise(function (resolve, reject) {
    var content = message.content;
    var path = makeTemporaryPath(filePrefix);
    var stream = fs.createWriteStream(path);
    var size = 0;

    content.on("error", reject);

    content.on("data", function (chunk) {
      size += chunk.length;
      stream.write(chunk);
    });

    content.on("end", function () {
      stream.end(function () {
        resolve(new File({
          path: path,
          name: message.filename,
          type: message.mediaType,
          size: size
        }));
      });
    });

    if (typeof content.resume === "function") content.resume();
  });
}

module.exports = saveToDisk;