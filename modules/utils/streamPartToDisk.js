var fs = require('fs');
var Promise = require('bluebird');
var makeTemporaryPath = require('./makeTemporaryPath');

function streamToDisk(part, filePrefix) {
  return new Promise(function (resolve, reject) {
    var path = makeTemporaryPath(filePrefix);
    var stream = fs.createWriteStream(path);
    var size = 0;

    part.content.on('data', function (chunk) {
      size += chunk.length;
      stream.write(chunk);
    });

    part.content.on('end', function () {
      stream.end(function () {
        resolve({
          path: path,
          name: part.filename,
          type: part.type,
          size: size
        });
      });
    });
  });
}

module.exports = streamToDisk;
