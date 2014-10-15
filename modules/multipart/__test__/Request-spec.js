require('./helper');
var Request = mach.Request;

var fs = require('fs');
var path = require('path');
var fixturesDir = path.join(__dirname, 'fixtures');

function getFixture(fixtureName) {
  return fs.readFileSync(path.join(fixturesDir, fixtureName), arguments[1]);
}

describe('Request', function () {
  describe('parseContent', function () {

    describe('when using Content-Type: multipart/form-data', function () {
      describe('when the content is encoded properly', function () {
        var content;
        beforeEach(function () {
          content = getFixture('content_type_no_filename');
          request = new Request({
            headers: { 'Content-Type': 'multipart/form-data; boundary=AaB03x' },
            content: content
          });
        });

        it('parses the content', function () {
          return request.parseContent().then(function (params) {
            assert(params);
            assert(params.text);
          });
        });

        it('returns strings for non-file values', function () {
          return request.parseContent().then(function (params) {
            expect(typeof params.text).toEqual('string');
          });
        });
      });
    });

  });
});
