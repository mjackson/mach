var fs = require('fs');
var Promise = require('bluebird');
var makeTemporaryPath = require('./makeTemporaryPath');

function streamToDisk(part, filePrefix) {
  var temporaryPath = makeTemporaryPath(filePrefix);
  var info = {
    path: temporaryPath,
    name: part.filename,
    type: part.type,
    size: 0
  };

  var stream = fs.createWriteStream(info.path);

  return new Promise(function (resolve, reject) {
    part.content.on('data', function (chunk) {
      info.size += chunk.length;
      stream.write(chunk);
    });

    part.content.on('end', function () {
      stream.end(function () {
        resolve(info);
      });
    });
  });
}

module.exports = streamToDisk;
