require('./helper');
var Message = mach.Message;

describe('Message', function () {
  var message;
  beforeEach(function () {
    message = new Message;
  });

  describe('addHeader', function () {

    it('normalizes header names', function () {
      message.addHeader('content-type', 'text/html');
      expect(message.headers['Content-Type']).toEqual('text/html');
    });

    describe('when the header has not been previously set', function () {
      it('sets the header to the given value', function () {
        message.addHeader('Test', 'value');
        expect(message.headers['Test']).toEqual('value');

        message.addHeader('Test-Int', 1);
        expect(message.headers['Test-Int']).toEqual(1);
      });
    });

    describe('when the header has been previously set', function () {
      beforeEach(function () {
        message.addHeader('Test', 'previousValue');
      });

      it('sets the header to an array of header values', function () {
        message.addHeader('Test', 'value');
        expect(message.headers['Test']).toEqual(['previousValue', 'value']);
      });

    });
  });

  describe('bufferContent', function () {
    it('responds to the message content being set', function () {
      message.content = 'foo';
      return message
        .bufferContent()
        .then(function(content) {
          expect(content.toString()).toEqual('foo');

          message.content = 'bar';
          return message.bufferContent();
        })
        .then(function(content) {
          expect(content.toString()).toEqual('bar');
        });
    });
  });
});
