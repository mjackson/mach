var fs = require('fs');

function isDirectory(path) {
  return fs.statSync(path).isDirectory();
}

module.exports = isDirectory;
