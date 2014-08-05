require('./helper');

describe('mach.catch', function () {
  describe('when an Error is thrown from downstream', function () {
    var caughtError;
    beforeEach(function () {
      caughtError = null;
      return callApp(mach.catch(function (request) {
        throw new Error('boom!');
      })).then(null, function (error) {
        caughtError = error;
      });
    });

    it('throws it', function () {
      assert(caughtError);
    });
  });

  describe('when a non-Error is thrown from downstream', function () {
    beforeEach(function () {
      return callApp(mach.catch(function (request) {
        throw 404;
      }));
    });

    it('returns it', function () {
      assert(lastResponse);
      expect(lastResponse.status).toEqual(404);
    });
  });
});
