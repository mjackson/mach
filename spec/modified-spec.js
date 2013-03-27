require('./helper');

describe('mach.modified', function () {
  var etag, lastModified, app;
  beforeEach(function () {
    etag = 'abc';
    lastModified = new Date;
    app = mach.modified(function (request) {
      return {
        status: 200,
        headers: {
          'ETag': etag,
          'Last-Modified': lastModified.toUTCString()
        },
        content: ''
      };
    });
  });

  describe('when a request uses the If-None-Match header', function () {
    describe('that does not match the ETag response header', function () {
      beforeEach(function () {
        return callApp(app, {
          headers: { 'If-None-Match': 'def' }
        });
      });

      it('returns 200', function () {
        assert.equal(lastResponse.status, 200);
      });
    });

    describe('that matches the ETag response header', function () {
      beforeEach(function () {
        return callApp(app, {
          headers: { 'If-None-Match': etag }
        });
      });

      it('returns 304', function () {
        assert.equal(lastResponse.status, 304);
      });
    });
  });

  describe('when a request uses the If-Modified-Since header', function () {
    describe('that is less than the Last-Modified response header', function () {
      beforeEach(function () {
        return callApp(app, {
          headers: {
            'If-Modified-Since': (new Date(lastModified.getTime() - 1000)).toUTCString()
          }
        });
      });

      it('returns 200', function () {
        assert.equal(lastResponse.status, 200);
      });
    });

    describe('that is equal to the Last-Modified response header', function () {
      beforeEach(function () {
        return callApp(app, {
          headers: {
            'If-Modified-Since': (new Date(lastModified.getTime() - 0)).toUTCString()
          }
        });
      });

      it('returns 200', function () {
        assert.equal(lastResponse.status, 200);
      });
    });

    describe('that is greater than the Last-Modified response header', function () {
      beforeEach(function () {
        return callApp(app, {
          headers: {
            'If-Modified-Since': (new Date(lastModified.getTime() + 1000)).toUTCString()
          }
        });
      });

      it('returns 304', function () {
        assert.equal(lastResponse.status, 304);
      });
    });
  });
});
