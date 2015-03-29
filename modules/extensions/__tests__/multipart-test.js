var expect = require('expect');
var mach = require('../../index');

var getFixture = require('../../multipart/__tests__/getFixture');

describe('extensions/multipart', function () {

  beforeEach(function () {
    mach.extend(require('../multipart'));
  });

  var message;

  describe('a multipart message', function () {
    beforeEach(function () {
      message = new mach.Message(
        getFixture('content_type_no_filename'),
        {
          'Content-Type': 'multipart/form-data; boundary=AaB03x'
        }
      );
    });

    it('knows its multipart boundary', function () {
      expect(message.multipartBoundary).toEqual('AaB03x');
    });

    it('parses its content correctly', function () {
      return message.parseContent().then(function (params) {
        expect(params.text).toEqual('contents');
      });
    });
  });

  describe('a message that is part of a multipart message', function () {
    beforeEach(function () {
      message = new mach.Message(
        'contents',
        {
          'Content-Disposition': 'form-data; name="files"; filename="escape \\"quotes"'
        }
      );
    });

    it('knows its name', function () {
      expect(message.name).toEqual('files');
    });

    it('knows its filename', function () {
      expect(message.filename).toEqual('escape "quotes');
    });
  });

});
