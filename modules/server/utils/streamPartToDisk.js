var fs = require('fs');
var Promise = require('./Promise');
var makeTemporaryPath = require('./makeTemporaryPath');

function streamToDisk(part, filePrefix) {
  return new Promise(function (resolve, reject) {
    var content = part.content;
    var path = makeTemporaryPath(filePrefix);
    var stream = fs.createWriteStream(path);
    var size = 0;

    content.on('error', reject);

    content.on('data', function (chunk) {
      size += chunk.length;
      stream.write(chunk);
    });

    content.on('end', function () {
      stream.end(function () {
        resolve({
          path: path,
          name: part.filename,
          type: part.contentType,
          size: size
        });
      });
    });

    if (typeof content.resume === 'function')
      content.resume();
  });
}

module.exports = streamToDisk;
