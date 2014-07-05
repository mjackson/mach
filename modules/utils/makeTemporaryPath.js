var os = require('os');
var path = require('path');

function makeTemporaryPath(prefix) {
  prefix = prefix || '';

  var random = (Math.random() * 0x100000000 + 1).toString(36);
  var now = new Date();
  var date = '' + now.getYear() + now.getMonth() + now.getDate();
  var name = [ prefix, date, '-', process.pid, '-', random ].join('');

  return path.join(os.tmpDir(), name);
}

module.exports = makeTemporaryPath;
