require('./helper');

function hundredLength() {
  return {
    headers: { 'Content-Length': 0 }
  };
}

describe('mach.logger', function () {
  describe('when a response has Content-Length of 100', function () {
    var messages, messageHandler;
    beforeEach(function () {
      messages = [];
      messageHandler = function (message) {
        messages.push(message);
      };

      return callApp(mach.logger(hundredLength, messageHandler));
    });

    it('logs a content length of 0', function () {
      assert(messages[0]);

      var match = messages[0].match(/\b(\d+) ([0-9\.]+)\b$/);
      assert(match);

      var contentLength = match[1];
      expect(contentLength).toEqual('0');
    });
  });
});
