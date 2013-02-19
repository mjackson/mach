require('./helper');
var multipart = mach.multipart;
var utils = mach.utils;

describe('multipart', function () {
  describe('Parser', function () {

    describe('with a boundary of "abc"', function () {
      var parser = new multipart.Parser('abc');

      it('has the correct boundary', function () {
        assert.deepEqual(utils.slice(parser.boundary), [13, 10, 45, 45, 97, 98, 99]);
        assert.deepEqual(parser.boundaryChars, { 10: true, 13: true, 45: true, 97: true, 98: true, 99: true });
      });
    });

    var params;
    function parseFixtureBeforeEach(fixtureName, boundary) {
      beforeEach(function () {
        return parseFixture(fixtureName, boundary).then(function (newParams) {
          params = newParams;
        });
      });
    }

    describe('for a message with a content type and no filename', function () {
      parseFixtureBeforeEach('content_type_no_filename');

      it('correctly parses the text contents', function () {
        assert.equal('contents', params.text);
      });
    });

    describe('for a webkit style message boundary', function () {
      parseFixtureBeforeEach('webkit', '----WebKitFormBoundaryWLHCs9qmcJJoyjKR');

      it('correctly parses', function () {
        assert.equal(params._method, 'put');
        assert.equal(params['profile[blog]'], '');
        assert.equal(params.media, '');
        assert.equal(params.commit, 'Save');
      });
    });

    describe('for a binary file upload', function () {
      parseFixtureBeforeEach('binary');

      it('correctly parses the text parameters', function () {
        assert.equal('Larry', params['submit-name']);
      });

      it('correctly parses the file name', function () {
        var file = params.files;
        assert.ok(file);
        assert.equal('rack-logo.png', file.name);
      });

      it('correctly parses the file content type', function () {
        var file = params.files;
        assert.ok(file);
        assert.equal(file.type, 'image/png');
      });

      it("correctly parses the file's contents", function () {
        var file = params.files;
        assert.ok(file);
        assert.equal(fs.readFileSync(file.path).length, 26473);
      });
    });

    describe('for a text file upload', function () {
      parseFixtureBeforeEach('text');

      it('correctly parses the text parameters', function () {
        assert.equal(params['submit-name'], 'Larry');
        assert.equal(params['submit-name-with-content'], 'Berry');
      });

      it('correctly parses the file name', function () {
        var file = params.files;
        assert.ok(file);
        assert.equal(file.name, 'file1.txt');
      });

      it('correctly parses the file content type', function () {
        var file = params.files;
        assert.ok(file);
        assert.equal(file.type, 'text/plain');
      });

      it("correctly parses the file's contents", function () {
        var file = params.files;
        assert.ok(file);
        assert.equal(fs.readFileSync(file.path, 'utf8'), 'contents');
      });
    });

    describe('for a text file upload using IE-style filename', function () {
      parseFixtureBeforeEach('text_ie');

      it('correctly parses and clean up the file name', function () {
        var file = params.files;
        assert.ok(file);
        assert.equal(file.name, 'file1.txt');
      });

      it('correctly parses the file content type', function () {
        var file = params.files;
        assert.ok(file);
        assert.equal(file.type, 'text/plain');
      });

      it("correctly parses the file's contents", function () {
        var file = params.files;
        assert.ok(file);
        assert.equal(fs.readFileSync(file.path, 'utf8'), 'contents');
      });
    });

    describe('for a multipart/mixed message', function () {
      parseFixtureBeforeEach('mixed_files');

      it('correctly parses a text field', function () {
        assert.equal(params.foo, 'bar');
      });

      it('correctly parses a nested multipart message', function () {
        var file = params.files;
        assert.ok(file);
        assert.equal(252, file.length);
      });
    });

    describe('for a message with no file selected', function () {
      parseFixtureBeforeEach('none');

      it('returns the field as an empty string', function () {
        var file = params.files;
        assert.ok(typeof file !== 'undefined');
        assert.equal(file, '');
      });
    });

    describe('for a message with a filename with escaped quotes', function () {
      parseFixtureBeforeEach('filename_with_escaped_quotes');

      it('correctly parses the file name', function () {
        var file = params.files;
        assert.ok(file);
        assert.ok(file.name);
        assert.equal(file.name, 'escape "quotes');
      });

      it('correctly parses the file content type', function () {
        var file = params.files;
        assert.ok(file);
        assert.ok(file.type);
        assert.equal(file.type, 'application/octet-stream');
      });

      it("correctly parses the file's contents", function () {
        var file = params.files;
        assert.ok(file);
        assert.ok(file.path);
        assert.equal(fs.readFileSync(file.path, 'utf8'), 'contents');
      });
    });

    describe('for a message with a filename with unescaped quotes', function () {
      parseFixtureBeforeEach('filename_with_unescaped_quotes');

      it('correctly parses the file name', function () {
        var file = params.files;
        assert.ok(file);
        assert.ok(file.name);
        assert.equal(file.name, 'escape "quotes');
      });

      it('correctly parses the file content type', function () {
        var file = params.files;
        assert.ok(file);
        assert.ok(file.type);
        assert.equal(file.type, 'application/octet-stream');
      });

      it("correctly parses the file's contents", function () {
        var file = params.files;
        assert.ok(file);
        assert.ok(file.path);
        assert.equal(fs.readFileSync(file.path, 'utf8'), 'contents');
      });
    });

    describe('for a message with a filename with percent escaped quotes', function () {
      parseFixtureBeforeEach('filename_with_percent_escaped_quotes');

      it('correctly parses the file name', function () {
        var file = params.files;
        assert.ok(file);
        assert.ok(file.name);
        assert.equal(file.name, 'escape "quotes');
      });

      it('correctly parses the file content type', function () {
        var file = params.files;
        assert.ok(file);
        assert.ok(file.type);
        assert.equal(file.type, 'application/octet-stream');
      });

      it("correctly parses the file's contents", function () {
        var file = params.files;
        assert.ok(file);
        assert.ok(file.path);
        assert.equal(fs.readFileSync(file.path, 'utf8'), 'contents');
      });
    });

    describe('for a message with a filename and modification-date param', function () {
      parseFixtureBeforeEach('filename_and_modification_param');

      it('correctly parses the file name', function () {
        var file = params.files;
        assert.ok(file);
        assert.ok(file.name);
        assert.equal(file.name, 'genome.jpeg');
      });

      it('correctly parses the file content type', function () {
        var file = params.files;
        assert.ok(file);
        assert.ok(file.type);
        assert.equal(file.type, 'image/jpeg');
      });

      it("correctly parses the file's contents", function () {
        var file = params.files;
        assert.ok(file);
        assert.ok(file.path);
        assert.equal(fs.readFileSync(file.path, 'utf8'), 'contents');
      });
    });

    describe('for a message with a filename with unescaped quotes and modification-date param', function () {
      parseFixtureBeforeEach('filename_with_unescaped_quotes_and_modification_param');

      it('correctly parses the file name', function () {
        var file = params.files;
        assert.ok(file);
        assert.ok(file.name);
        assert.equal(file.name, '"human" genome.jpeg');
      });

      it('correctly parses the file content type', function () {
        var file = params.files;
        assert.ok(file);
        assert.ok(file.type);
        assert.equal(file.type, 'image/jpeg');
      });

      it("correctly parses the file's contents", function () {
        var file = params.files;
        assert.ok(file);
        assert.ok(file.path);
        assert.equal(fs.readFileSync(file.path, 'utf8'), 'contents');
      });
    });

  });
});

var q = require('q');
var path = require('path');
var fs = require('fs');
var tmpdir = path.join(__dirname, 'tmp');
var prefix = 'multipart-';

function parseFixture(name, boundary) {
  boundary = boundary || 'AaB03x';
  params = {};

  var deferred = q.defer();

  // Setup a new parser with the given boundary.
  var parser = new multipart.Parser(boundary, tmpdir, prefix);

  var params = {};
  parser.onParam = function (name, value) {
    params[name] = value;
  };

  var ended = false;
  parser.onEnd = function () {
    assert.ok(!ended); // onEnd should only be called once
    ended = true;
    deferred.resolve(params);
  };

  // Write the contents of the fixture to the parser.
  var buffer = fs.readFileSync(path.join(__dirname, '_files', name));
  assert.equal(parser.write(buffer), buffer.length);
  assert.doesNotThrow(function () {
    parser.end();
  });

  return deferred.promise;
}

if (!process.env.DIRTY) {
  process.on('exit', function () {
    var files = fs.readdirSync(tmpdir);
    for (var i = 0; i < files.length; ++i) {
      if (files[i].substring(0, prefix.length) === prefix) {
        fs.unlinkSync(path.join(tmpdir, files[i]));
      }
    }
  });
}
