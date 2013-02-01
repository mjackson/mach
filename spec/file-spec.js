require('./helper');
var path = require('path');
var fs = require('fs');
var file = mach.file;

describe('mach.file', function () {
  var filename = path.basename(__filename);
  var contents = fs.readFileSync(__filename, 'utf8');

  describe('with a single index file', function () {
    var app = file(__dirname, filename);

    describe('when a file is requested', function () {
      beforeEach(function () {
        return callApp(app, '/' + filename);
      });

      it('returns 200', function () {
        assert.equal(lastResponse.status, 200);
      });

      it('serves that file', function () {
        assert.equal(lastResponse.buffer, contents);
      });

      it('sets the correct Content-Type', function () {
        assert.equal(lastResponse.headers['Content-Type'], 'application/javascript');
      });
    });

    describe('when a directory is requested', function () {
      beforeEach(function () {
        return callApp(app, '/');
      });

      it('returns 200', function () {
        assert.equal(lastResponse.status, 200);
      });

      it('serves the index file', function () {
        assert.equal(lastResponse.buffer, contents);
      });

      it('sets the correct Content-Type', function () {
        assert.equal(lastResponse.headers['Content-Type'], 'application/javascript');
      });
    });

    describe('when a matching file cannot be found', function () {
      beforeEach(function () {
        return callApp(app, '/does-not-exist');
      });

      it('forwards the request to the downstream app', function () {
        assert.equal(lastResponse.status, 404);
      });
    });

    describe('when the path contains ".."', function () {
      beforeEach(function () {
        return callApp(app, '/../etc/passwd');
      });

      it('returns 403', function () {
        assert.equal(lastResponse.status, 403);
      });
    });
  });

  describe('with multiple index files', function () {
    var app = file(__dirname, ['index.html', filename]);

    describe('when a directory is requested', function () {
      beforeEach(function () {
        return callApp(app, '/');
      });

      it('returns 200', function () {
        assert.equal(lastResponse.status, 200);
      });

      it('serves the first index file that exists', function () {
        assert.equal(lastResponse.buffer, contents);
      });

      it('sets the correct Content-Type', function () {
        assert.equal(lastResponse.headers['Content-Type'], 'application/javascript');
      });
    });
  });
});
