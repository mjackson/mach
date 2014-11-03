require('./helper');

function ok() {
  return 200;
}

describe('mach.favicon', function () {
  describe('when /favicon.ico is requested', function () {
    beforeEach(function () {
      return callApp(mach.favicon(ok), '/favicon.ico');
    });

    it('returns 404', function () {
      assert(lastResponse);
      expect(lastResponse.status).toEqual(404);
    });
  });

  describe('when /favicon.ico?a=b is requested', function () {
    beforeEach(function () {
      return callApp(mach.favicon(ok), '/favicon.ico?a=b');
    });

    it('returns 404', function () {
      assert(lastResponse);
      expect(lastResponse.status).toEqual(404);
    });
  });
});
