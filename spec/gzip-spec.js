require('./helper');
var fs = require('fs');
var gzip = mach.gzip;

describe('gzip', function () {
  var testFile = specFile('test.txt');
  var content = fs.readFileSync(testFile, 'utf8');
  var gzipContent = fs.readFileSync(testFile + '.gz');

  var app = gzip(function (request) {
    return {
      headers: { 'Content-Type': 'text/plain' },
      content: content
    };
  });

  describe('when the client accepts gzip encoding', function () {
    beforeEach(function (callback) {
      return callApp(app, {
        headers: { 'Accept-Encoding': 'gzip, *' }
      }, true);
    });

    it('sets the Content-Encoding header to "gzip"', function () {
      assert.equal(lastResponse.headers['Content-Encoding'], 'gzip');
    });

    it('sets the Vary header to "Accept-Encoding"', function () {
      assert.equal(lastResponse.headers['Vary'], 'Accept-Encoding');
    });

    it('gzip-encodes the response content', function () {
      compareBuffers(lastResponse.buffer, gzipContent);
    });
  });

  describe('when the client does not accept gzip encoding', function () {
    beforeEach(function (callback) {
      callApp(app);
    });

    it('does not gzip-encode the body');
  });
});

require('buffertools');
function compareBuffers(one, two) {
  assert.equal(one.compare(two), 0, 'buffers are not equal');
}
