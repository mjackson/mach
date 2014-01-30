require('./helper');

describe('mach.logger', function () {
  describe('when a response has Content-Length of 0', function () {
    var app, log;
    beforeEach(function () {
      log = {};
      app = mach.logger(function (request) {
        return { 'Content-Length': 0 };
      }, fakeStream(log));

      return callApp(app);
    });

    it('logs a content length of 0', function () {
      assert(log.data);
      var entries = log.data.split('\n');
      var match = entries[0].match(/\b(\d+) ([0-9\.]+)\b$/);
      assert(match);
      var contentLength = match[1];
      assert.equal(contentLength, '0');
    });
  });
});
