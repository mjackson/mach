var expect = require('expect');
var file = require('../file');
var callApp = require('./callApp');
var getFixture = require('./getFixture');

describe('mach.file', function () {
  describe('with a single index file', function () {
    var contents = getFixture('jquery-1.8.3.js', 'utf8');
    var app = file(null, {
      root: __dirname + '/fixtures',
      index: 'jquery-1.8.3.js'
    });

    describe('when a file is requested', function () {
      beforeEach(function () {
        return callApp(app, '/jquery-1.8.3.js');
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
    var contents = getFixture('jquery-1.8.3.js', 'utf8');
    var app = file(null, {
      root: __dirname + '/fixtures',
      index: [ 'index.html', 'jquery-1.8.3.js' ]
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
