var expect = require('expect');
var callApp = require('../../utils/callApp');
var createMapper = require('../mapper');

describe('middleware/mapper', function () {

  function showInfo(conn) {
    return {
      status: 200,
      headers: {
        'Basename': conn.basename,
        'Pathname': conn.pathname
      }
    };
  }

  var app;
  beforeEach(function () {
    app = createMapper({
      '/one': showInfo,
      'http://example.org/two': showInfo,
      'http://example.net/three': showInfo
    });
  });

  describe('when the request does not match a mapping', function () {
    it('passes the request through to the default app', function () {
      return callApp(app, '/three').then(function (conn) {
        expect(conn.status).toEqual(404);
      });
    });
  });

  describe('when a request matches a mapping by path', function () {
    describe('and the mapping has a different host', function () {
      it('passes the request through to the default app', function () {
        return callApp(app, 'http://example.com/two').then(function (conn) {
          expect(conn.status).toEqual(404);
        });
      });
    });

    describe('and the mapping has no host', function () {
      it('passes the request through to the mapping', function () {
        return callApp(app, '/one/messages').then(function (conn) {
          expect(conn.status).toEqual(200);
          expect(conn.response.headers['Basename']).toEqual('/one');
          expect(conn.response.headers['Pathname']).toEqual('/messages');
        });
      });
    });

    describe('and the mapping has a matching host', function () {
      it('passes the request through to the mapping', function () {
        return callApp(app, 'http://example.org/two/messages').then(function (conn) {
          expect(conn.status).toEqual(200);
          expect(conn.response.headers['Basename']).toEqual('/two');
          expect(conn.response.headers['Pathname']).toEqual('/messages');
        });
      });

      describe('and the request is on a different port', function () {
        it('passes the request through to the mapping', function () {
          return callApp(app, 'http://example.org:5000/two/messages').then(function (conn) {
            expect(conn.status).toEqual(200);
            expect(conn.response.headers['Basename']).toEqual('/two');
            expect(conn.response.headers['Pathname']).toEqual('/messages');
          });
        });
      });

      describe('that was specified with a custom port', function () {
        it('passes the request through to the mapping', function () {
          return callApp(app, 'http://example.net/three/messages').then(function (conn) {
            expect(conn.status).toEqual(200);
            expect(conn.response.headers['Basename']).toEqual('/three');
            expect(conn.response.headers['Pathname']).toEqual('/messages');
          });
        });
      });
    });

    describe('and there is no remaining path', function () {
      it('passes the request through to the mapping', function () {
        return callApp(app, '/one').then(function (conn) {
          expect(conn.status).toEqual(200);
          expect(conn.response.headers['Basename']).toEqual('/one');
          expect(conn.response.headers['Pathname']).toEqual('/');
        });
      });
    });
  });

});
