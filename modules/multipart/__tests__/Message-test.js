var assert = require('assert');
var expect = require('expect');
var Message = require('../../Message');
var getFixture = require('./getFixture');

describe('Message', function () {
  describe('parseContent', function () {

    describe('when using Content-Type: multipart/form-data', function () {
      describe('when the content is encoded properly', function () {
        var message;
        beforeEach(function () {
          message = new Message(
            getFixture('content_type_no_filename'),
            { 'Content-Type': 'multipart/form-data; boundary=AaB03x' }
          );
        });

        it('parses the content', function () {
          return message.parseContent().then(function (params) {
            assert(params);
            assert(params.text);
          });
        });

        it('returns strings for non-file values', function () {
          return message.parseContent().then(function (params) {
            expect(typeof params.text).toEqual('string');
          });
        });
      });
    });

  });
});
