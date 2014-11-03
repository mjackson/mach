var fs = require('fs');
var path = require('path');
var fixturesDir = path.join(__dirname, 'fixtures');

function getFixture(fixtureName) {
  return fs.readFileSync(path.join(fixturesDir, fixtureName), arguments[1]);
}

module.exports = getFixture;
