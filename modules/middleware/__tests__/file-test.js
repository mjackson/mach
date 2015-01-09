var expect = require('expect');
var file = require('../file');
var callApp = require('../../utils/callApp');
var getFixture = require('./getFixture');

describe('middleware/file', function () {
  describe('with a single index file', function () {
    var contents = getFixture('jquery-1.8.3.js', 'utf8');
    var app = file({
      root: __dirname + '/fixtures',
      index: 'jquery-1.8.3.js'
    });

    describe('when a file is requested', function () {
      it('serves the file correctly', function () {
        return callApp(app, '/jquery-1.8.3.js').then(function (conn) {
          expect(conn.status).toEqual(200);
          expect(conn.responseText).toEqual(contents);
          expect(conn.response.headers['Content-Type']).toEqual('application/javascript');
          expect(conn.response.headers['Last-Modified']).toBeA('string');
        });
      });
    });

    describe('when a directory is requested', function () {
      it('serves the index file correctly', function () {
        return callApp(app, '/').then(function (conn) {
          expect(conn.status).toEqual(200);
          expect(conn.responseText).toEqual(contents);
          expect(conn.response.headers['Content-Type']).toEqual('application/javascript');
        });
      });
    });

    describe('when a matching file cannot be found', function () {
      it('forwards the request to the downstream app', function () {
        return callApp(app, '/does-not-exist').then(function (conn) {
          expect(conn.status).toEqual(404);
        });
      });
    });

    describe('when the path contains ".."', function () {
      it('returns 403', function () {
        return callApp(app, '/../etc/passwd').then(function (conn) {
          expect(conn.status).toEqual(403);
        });
      });
    });
  });

  describe('with multiple index files', function () {
    var contents = getFixture('jquery-1.8.3.js', 'utf8');
    var app = file({
      root: __dirname + '/fixtures',
      index: [ 'not-found1.html', 'jquery-1.8.3.js', 'not-found2.txt' ]
    });

    describe('when a directory is requested', function () {
      it('correctly serves the first index file that exists', function () {
        return callApp(app, '/').then(function (conn) {
          expect(conn.status).toEqual(200);
          expect(conn.responseText).toEqual(contents);
          expect(conn.response.headers['Content-Type']).toEqual('application/javascript');
        });
      });
    });
  });

  describe('with useLastModified=false and useETag=true', function () {
    var app = file({
      root: __dirname + '/fixtures',
      index: 'jquery-1.8.3.js',
      useLastModified: false,
      useETag: true
    });

    describe('when a file is requested', function () {
      it('does not set the Last-Modified header', function () {
        return callApp(app, '/jquery-1.8.3.js').then(function (conn) {
          expect(conn.response.headers['Last-Modified']).toBe(undefined);
        });
      });

      it('sets the ETag header', function () {
        return callApp(app, '/jquery-1.8.3.js').then(function (conn) {
          expect(conn.response.headers['ETag']).toMatch(/"[a-f0-9]+"/);
        });
      });
    });
  });
});
