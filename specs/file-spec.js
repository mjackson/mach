require('./helper');
var path = require('path');
var fs = require('fs');

describe('mach.file', function () {
  describe('when a large file is requested', function () {
    var fullPath = specFile('jquery-1.8.3.js');
    var filename = path.basename(fullPath);
    var contents = fs.readFileSync(fullPath, 'utf8');
    var app = mach.file(null, path.dirname(fullPath));

    beforeEach(function () {
      return callApp(app, '/' + filename);
    });

    it('serves the file', function () {
      expect(lastResponse.buffer).toEqual(contents);
    });
  });

  describe('with a single index file', function () {
    var filename = path.basename(__filename);
    var contents = fs.readFileSync(__filename, 'utf8');
    var app = mach.file(null, {
      root: __dirname,
      index: filename
    });

    describe('when a file is requested', function () {
      beforeEach(function () {
        return callApp(app, '/' + filename);
      });

      it('returns 200', function () {
        expect(lastResponse.status).toEqual(200);
      });

      it('serves that file', function () {
        expect(lastResponse.buffer).toEqual(contents);
      });

      it('sets the correct Content-Type', function () {
        expect(lastResponse.headers['Content-Type']).toEqual('application/javascript');
      });
    });

    describe('when a directory is requested', function () {
      beforeEach(function () {
        return callApp(app, '/');
      });

      it('returns 200', function () {
        expect(lastResponse.status).toEqual(200);
      });

      it('serves the index file', function () {
        expect(lastResponse.buffer).toEqual(contents);
      });

      it('sets the correct Content-Type', function () {
        expect(lastResponse.headers['Content-Type']).toEqual('application/javascript');
      });
    });

    describe('when a matching file cannot be found', function () {
      beforeEach(function () {
        return callApp(app, '/does-not-exist');
      });

      it('forwards the request to the downstream app', function () {
        expect(lastResponse.status).toEqual(404);
      });
    });

    describe('when the path contains ".."', function () {
      beforeEach(function () {
        return callApp(app, '/../etc/passwd');
      });

      it('returns 403', function () {
        expect(lastResponse.status).toEqual(403);
      });
    });
  });

  describe('with multiple index files', function () {
    var filename = path.basename(__filename);
    var contents = fs.readFileSync(__filename, 'utf8');
    var app = mach.file(null, {
      root: __dirname,
      index: [ 'index.html', filename ]
    });

    describe('when a directory is requested', function () {
      beforeEach(function () {
        return callApp(app, '/');
      });

      it('returns 200', function () {
        expect(lastResponse.status).toEqual(200);
      });

      it('serves the first index file that exists', function () {
        expect(lastResponse.buffer).toEqual(contents);
      });

      it('sets the correct Content-Type', function () {
        expect(lastResponse.headers['Content-Type']).toEqual('application/javascript');
      });
    });
  });
});
