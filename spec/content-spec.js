require('./helper');
var Content = mach.Content;
var utils = mach.utils;
var Stream = require('stream');

describe('A mach.Content', function () {
  describe('when sourced from a Readable', function () {
    var string, source, content;
    beforeEach(function () {
      string = 'hello world';
      source = new Content(string);
      content = new Content(source);
    });

    it('emits all its content', function () {
      return utils.bufferStream(content).then(function (buffer) {
        assert.strictEqual(buffer.toString(), string);
      });
    });
  });

  describe('when sourced from a string', function () {
    var source, content;
    beforeEach(function () {
      source = 'hello world';
      content = new Content(source);
    });

    it('emits all its content', function () {
      return utils.bufferStream(content).then(function (buffer) {
        assert.strictEqual(buffer.toString(), source);
      });
    });
  });

  describe('when sourced from a Buffer', function () {
    var string, source, content;
    beforeEach(function () {
      string = 'hello world';
      source = new Buffer(string);
      content = new Content(source);
    });

    it('emits all its content', function () {
      return utils.bufferStream(content).then(function (buffer) {
        assert.strictEqual(buffer.toString(), string);
      });
    });
  });
});
