/* jshint -W058 */
var assert = require('assert');
var expect = require('expect');
var bodec = require('bodec');
var MaxLengthExceededError = require('../utils/MaxLengthExceededError');
var Message = require('../Message');

describe('a Message with "Content-Type: text/plain"', function () {
  var message;
  beforeEach(function () {
    message = new Message(null, { 'Content-Type': 'text/plain' });
  });

  it('has the correct mediaType', function () {
    expect(message.mediaType).toEqual('text/plain');
  });
});

describe('a Message with "Content-Type: text/html; charset=utf-8"', function () {
  var message;
  beforeEach(function () {
    message = new Message(null, { 'Content-Type': 'text/html; charset=utf-8' });
  });

  it('has the correct mediaType', function () {
    expect(message.mediaType).toEqual('text/html');
  });

  it('has the correct charset', function () {
    expect(message.charset).toEqual('utf-8');
  });

  describe('and the media type is modified', function () {
    beforeEach(function () {
      message.mediaType = 'text/plain';
    });

    it('has the correct mediaType', function () {
      expect(message.mediaType).toEqual('text/plain');
    });

    it('has the correct charset', function () {
      expect(message.charset).toEqual('utf-8');
    });
  });

  describe('and the charset is modified', function () {
    beforeEach(function () {
      message.charset = 'iso-5589-1';
    });

    it('has the correct mediaType', function () {
      expect(message.mediaType).toEqual('text/html');
    });

    it('has the correct charset', function () {
      expect(message.charset).toEqual('iso-5589-1');
    });
  });
});

describe('Message#addHeader', function () {
  var message;
  beforeEach(function () {
    message = new Message;
  });

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

describe('Message#bufferContent', function () {
  var message;
  beforeEach(function () {
    message = new Message;
  });

  it('responds to the message content being set', function () {
    message.content = 'foo';
    return message
      .bufferContent()
      .then(function (content) {
        expect(bodec.toString(content)).toEqual('foo');

        message.content = 'bar';
        return message.bufferContent();
      })
      .then(function (content) {
        expect(bodec.toString(content)).toEqual('bar');
      });
  });
});

describe('Message#parseContent', function () {

  var message;
  beforeEach(function () {
    message = new Message;
  });

  describe('when using an unknown Content-Type', function () {
    beforeEach(function () {
      message.headers['Content-Type'] = 'text/plain';
    });

    it('returns the content as a string', function () {
      return message.parseContent().then(function (params) {
        expect(params).toEqual('');
      });
    });
  }); // text/plain

  describe('when using Content-Type: application/json', function () {
    describe('when the content is valid JSON', function () {
      var object;
      beforeEach(function () {
        object = { a: 1, b: 'some value' };
        message = new Message(
          JSON.stringify(object), { 'Content-Type': 'application/json' }
        );
      });

      it('parses the content', function () {
        return message.parseContent().then(function (params) {
          expect(params).toEqual(object);
        });
      });
    });

    describe('when the content is not valid JSON', function () {
      beforeEach(function () {
        message = new Message(
          'hello world', { 'Content-Type': 'application/json' }
        );
      });

      it('throws an error', function () {
        return message.parseContent().then(function () {
          assert(false, 'successfully parsed invalid JSON');
        }, function (error) {
          assert(error);
        });
      });
    });

    describe('when the content is too large', function () {
      beforeEach(function () {
        message = new Message(
          '{}', { 'Content-Type': 'application/json' }
        );
      });

      it('throws MaxLengthExceededError', function () {
        return message.parseContent(1).then(function () {
          assert(false, 'successfully parsed a content stream that is too large');
        }, function (error) {
          assert(error);
          expect(error).toBeA(MaxLengthExceededError);
        });
      });
    });
  }); // application/json

  describe('when using Content-Type: application/x-www-form-urlencoded', function () {
    describe('when the content is URL-encoded', function () {
      beforeEach(function () {
        message = new Message(
          'a=1&b=some+value', { 'Content-Type': 'application/x-www-form-urlencoded' }
        );
      });

      it('parses the content', function () {
        return message.parseContent().then(function (params) {
          expect(params).toEqual({ a: 1, b: 'some value' });
        });
      });
    });

    describe('when the content is too large', function () {
      beforeEach(function () {
        message = new Message(
          'a=b', { 'Content-Type': 'application/x-www-form-urlencoded' }
        );
      });

      it('throws MaxLengthExceededError', function () {
        return message.parseContent(1).then(function () {
          assert(false, 'successfully parsed a content stream that is too large');
        }, function (error) {
          assert(error);
          expect(error).toBeA(MaxLengthExceededError);
        });
      });
    });
  }); // application/x-www-form-urlencoded

});
