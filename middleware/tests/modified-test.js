var expect = require('expect');
var callApp = require('../../utils/callApp');
var modified = require('../modified');

describe('middleware/modified', function () {

  var etag, lastModified, app;
  beforeEach(function () {
    etag = 'abc';
    lastModified = 'Tue, 26 Mar 2013 00:58:16 GMT';
    app = modified(function () {
      return {
        status: 200,
        headers: {
          'ETag': etag,
          'Last-Modified': lastModified
        },
        content: ''
      };
    });
  });

  describe('when a request uses the If-None-Match header', function () {
    describe('that does not match the ETag response header', function () {
      it('returns 200', function () {
        return callApp(app, {
          headers: {
            'If-None-Match': '"def"'
          }
        }).then(function (conn) {
          expect(conn.status).toEqual(200);
        });
      });
    });

    describe('that matches the ETag response header', function () {
      it('returns 304', function () {
        return callApp(app, {
          headers: {
            'If-None-Match': '"' + etag + '"'
          }
        }).then(function (conn) {
          expect(conn.status).toEqual(304);
        });
      });
    });
  });

  describe('when a request uses the If-Modified-Since header', function () {
    describe('with a value less than the Last-Modified response header', function () {
      it('returns 200', function () {
        return callApp(app, {
          headers: {
            'If-Modified-Since': 'Tue, 26 Mar 2013 00:58:15 GMT'
          }
        }).then(function (conn) {
          expect(conn.status).toEqual(200);
        });
      });
    });

    describe('with a value equal to the Last-Modified response header', function () {
      it('returns 304', function () {
        return callApp(app, {
          headers: {
            'If-Modified-Since': 'Tue, 26 Mar 2013 00:58:16 GMT'
          }
        }).then(function (conn) {
          expect(conn.status).toEqual(304);
        });
      });
    });

    describe('with a value greater than the Last-Modified response header', function () {
      it('returns 304', function () {
        return callApp(app, {
          headers: {
            'If-Modified-Since': 'Tue, 26 Mar 2013 00:58:17 GMT'
          }
        }).then(function (conn) {
          expect(conn.status).toEqual(304);
        });
      });
    });
  });

});
