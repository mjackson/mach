var fs = require('fs');

function fileExists(file) {
  return fs.existsSync(file);
}

module.exports = fileExists;
