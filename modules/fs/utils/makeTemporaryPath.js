var path = require('path');
var TMP_DIR = require('os').tmpDir();

function makeTemporaryPath(prefix) {
  prefix = prefix || '';

  var random = (Math.random() * 0x100000000 + 1).toString(36);
  var now = new Date();
  var date = '' + now.getYear() + now.getMonth() + now.getDate();
  var name = [ prefix, date, '-', process.pid, '-', random ].join('');

  return path.join(TMP_DIR, name);
}

module.exports = makeTemporaryPath;
