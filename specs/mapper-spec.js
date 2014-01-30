require('./helper');

describe('mach.mapper', function () {

  function showInfo(request) {
    return {
      status: 200,
      headers: {
        'Script-Name': request.scriptName,
        'Path-Info': request.pathInfo
      }
    };
  }

  var app;
  beforeEach(function () {
    app = mach.mapper();
    app.map('/one', showInfo);
    app.map('http://example.org/two', showInfo);
  });

  describe('when the request does not match a mapping', function () {
    beforeEach(function () {
      return callApp(app, '/three');
    });

    it('passes the request through to the default app', function () {
      assert(lastResponse);
      assert.equal(lastResponse.status, 404);
    });
  });

  describe('when a request matches a mapping by path', function () {
    describe('and the mapping has a different host', function () {
      beforeEach(function () {
        return callApp(app, {
          headers: {
            Host: 'example.com'
          },
          path: '/two'
        });
      });

      it('passes the request through to the default app', function () {
        assert(lastResponse);
        assert.equal(lastResponse.status, 404);
      });
    });

    describe('and the mapping has no host', function () {
      beforeEach(function () {
        return callApp(app, '/one/messages');
      });

      it('passes the request through to the mapping', function () {
        assert(lastResponse);
        assert.equal(lastResponse.status, 200);
      });

      it('puts the matching portion of the URL in the scriptName variable', function () {
        assert.equal(lastResponse.headers['Script-Name'], '/one');
      });

      it('stuffs the remainder of the path into the pathInfo variable', function () {
        assert.equal(lastResponse.headers['Path-Info'], '/messages');
      });
    });

    describe('and the mapping has a matching host', function () {
      beforeEach(function () {
        return callApp(app, {
          headers: {
            Host: 'example.org'
          },
          path: '/two/messages'
        });
      });

      it('passes the request through to the mapping', function () {
        assert(lastResponse);
        assert.equal(lastResponse.status, 200);
      });

      it('puts the matching portion of the URL in the scriptName variable', function () {
        assert.equal(lastResponse.headers['Script-Name'], '/two');
      });

      it('stuffs the remainder of the path into the pathInfo variable', function () {
        assert.equal(lastResponse.headers['Path-Info'], '/messages');
      });
    });
  });

});
