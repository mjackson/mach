var assert = require('assert');
var parseContent = require('../parseContent');
var Parser = require('../Parser');
var getFixture = require('./getFixture');

describe('Parser', function () {

  describe('with a boundary of "abc"', function () {
    var parser = new Parser('abc', function () {});

    it('has the correct boundary', function () {
      assert.deepEqual(Array.prototype.slice.call(parser.boundary), [ 13, 10, 45, 45, 97, 98, 99 ]);
      assert.deepEqual(parser.boundaryChars, { 10: true, 13: true, 45: true, 97: true, 98: true, 99: true });
    });
  });

  var parts;

  function beforeEachParseFixture(fixtureName, boundary) {
    boundary = boundary || 'AaB03x';
    beforeEach(function () {
      var message = getFixture(fixtureName);
      return parseContent(message, boundary, partHandler).then(function (object) {
        parts = object;
      });
    });
  }

  function partHandler(part) {
    return part.bufferContent().then(function (chunk) {
      part.buffer = chunk;
      return part;
    });
  }

  describe('for a message with a content type and no filename', function () {
    beforeEachParseFixture('content_type_no_filename');

    it('correctly parses the text contents', function () {
      assert(parts.text);
      assert.equal(parts.text.buffer, 'contents');
    });
  });

  describe('for a webkit style message boundary', function () {
    beforeEachParseFixture('webkit', '----WebKitFormBoundaryWLHCs9qmcJJoyjKR');

    it('correctly parses', function () {
      assert.equal(parts._method.buffer, 'put');
      assert.equal(parts['profile[blog]'].buffer, '');
      assert.equal(parts.media.buffer, '');
      assert.equal(parts.commit.buffer, 'Save');
    });
  });

  describe('for a binary file upload', function () {
    beforeEachParseFixture('binary');

    it('correctly parses the text parameters', function () {
      assert.equal(parts['submit-name'].buffer, 'Larry');
    });

    it('correctly parses the file name', function () {
      assert(parts.files);
      assert.equal(parts.files.filename, 'rack-logo.png');
    });

    it('correctly parses the file content type', function () {
      assert(parts.files);
      assert.equal(parts.files.contentType, 'image/png');
    });

    it("correctly parses the file's contents", function () {
      assert(parts.files);
      assert(parts.files.buffer);
      assert.equal(parts.files.buffer.length, 26473);
    });
  });

  describe('for a text file upload', function () {
    beforeEachParseFixture('text');

    it('correctly parses the text parameters', function () {
      assert.equal(parts['submit-name'].buffer, 'Larry');
      assert.equal(parts['submit-name-with-content'].buffer, 'Berry');
    });

    it('correctly parses the file name', function () {
      assert(parts.files);
      assert.equal(parts.files.filename, 'file1.txt');
    });

    it('correctly parses the file content type', function () {
      assert(parts.files);
      assert.equal(parts.files.contentType, 'text/plain');
    });

    it("correctly parses the file's contents", function () {
      assert(parts.files);
      assert.equal(parts.files.buffer, 'contents');
    });
  });

  describe('for a text file upload using IE-style filename', function () {
    beforeEachParseFixture('text_ie');

    it('correctly parses and clean up the file name', function () {
      assert(parts.files);
      assert.equal(parts.files.filename, 'file1.txt');
    });

    it('correctly parses the file content type', function () {
      assert(parts.files);
      assert.equal(parts.files.contentType, 'text/plain');
    });

    it("correctly parses the file's contents", function () {
      assert(parts.files);
      assert.equal(parts.files.buffer, 'contents');
    });
  });

  describe('for a multipart/mixed message', function () {
    beforeEachParseFixture('mixed_files');

    it('correctly parses a text field', function () {
      assert(parts.foo);
      assert.equal(parts.foo.buffer, 'bar');
    });

    it('correctly parses a nested multipart message', function () {
      assert(parts.files);
      assert.equal(parts.files.buffer.length, 252);
    });
  });

  describe('for a message with no file selected', function () {
    beforeEachParseFixture('none');

    it('returns the field as an empty string', function () {
      assert(parts.files);
      assert.equal(parts.files.buffer, '');
    });
  });

  describe('for a message with a filename with escaped quotes', function () {
    beforeEachParseFixture('filename_with_escaped_quotes');

    it('correctly parses the file name', function () {
      assert(parts.files);
      assert.equal(parts.files.filename, 'escape "quotes');
    });

    it('correctly parses the file content type', function () {
      assert(parts.files);
      assert.equal(parts.files.contentType, 'application/octet-stream');
    });

    it("correctly parses the file's contents", function () {
      assert(parts.files);
      assert.equal(parts.files.buffer, 'contents');
    });
  });

  describe('for a message with a filename with unescaped quotes', function () {
    beforeEachParseFixture('filename_with_unescaped_quotes');

    it('correctly parses the file name', function () {
      assert(parts.files);
      assert.equal(parts.files.filename, 'escape "quotes');
    });

    it('correctly parses the file content type', function () {
      assert(parts.files);
      assert.equal(parts.files.contentType, 'application/octet-stream');
    });

    it("correctly parses the file's contents", function () {
      assert(parts.files);
      assert.equal(parts.files.buffer, 'contents');
    });
  });

  describe('for a message with a filename with percent escaped quotes', function () {
    beforeEachParseFixture('filename_with_percent_escaped_quotes');

    it('correctly parses the file name', function () {
      assert(parts.files);
      assert.equal(parts.files.filename, 'escape "quotes');
    });

    it('correctly parses the file content type', function () {
      assert(parts.files);
      assert.equal(parts.files.contentType, 'application/octet-stream');
    });

    it("correctly parses the file's contents", function () {
      assert(parts.files);
      assert.equal(parts.files.buffer, 'contents');
    });
  });

  describe('for a message with a filename and modification-date param', function () {
    beforeEachParseFixture('filename_and_modification_param');

    it('correctly parses the file name', function () {
      assert(parts.files);
      assert.equal(parts.files.filename, 'genome.jpeg');
    });

    it('correctly parses the file content type', function () {
      assert(parts.files);
      assert.equal(parts.files.contentType, 'image/jpeg');
    });

    it("correctly parses the file's contents", function () {
      assert(parts.files);
      assert.equal(parts.files.buffer, 'contents');
    });
  });

  describe('for a message with a filename with unescaped quotes and modification-date param', function () {
    beforeEachParseFixture('filename_with_unescaped_quotes_and_modification_param');

    it('correctly parses the file name', function () {
      assert(parts.files);
      assert.equal(parts.files.filename, '"human" genome.jpeg');
    });

    it('correctly parses the file content type', function () {
      assert(parts.files);
      assert.equal(parts.files.contentType, 'image/jpeg');
    });

    it("correctly parses the file's contents", function () {
      assert(parts.files);
      assert.equal(parts.files.buffer, 'contents');
    });
  });

});
