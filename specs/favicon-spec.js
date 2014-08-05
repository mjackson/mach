require('./helper');
var favicon = mach.favicon;
var utils = mach.utils;

describe('mach.favicon', function () {
  describe('when /favicon.ico is requested', function () {
    beforeEach(function () {
      return callApp(favicon(utils.defaultApp), '/favicon.ico');
    });

    it('returns 404', function () {
      assert(lastResponse);
      expect(lastResponse.status).toEqual(404);
    });
  });
});
