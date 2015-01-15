/* jshint -W058 */
var assert = require('assert');
var expect = require('expect');
var Accept = require('../Accept');

describe('Accept', function () {
  var header;

  describe('with no value', function () {
    beforeEach(function () {
      header = new Accept;
    });

    it('has the correct toString representation', function () {
      expect(header.toString()).toEqual('Accept: */*');
    });

    it('has the correct quality factors', function () {
      expect(header.qualityFactorForMediaType('text/html')).toEqual(1);
    });

    it('accepts text/html', function () {
      assert(header.accepts('text/html'));
    });
  });

  describe('with a value of "text/html"', function () {
    beforeEach(function () {
      header = new Accept('text/html');
    });

    it('has the correct quality factors', function () {
      expect(header.qualityFactorForMediaType('text/html')).toEqual(1);
      expect(header.qualityFactorForMediaType('image/png')).toEqual(0);
    });

    it('accepts text/html', function () {
      assert(header.accepts('text/html'));
    });

    it('does not accept image/png', function () {
      assert(!header.accepts('image/png'));
    });
  });

  describe('with a value of "text/*;q=0.3, text/html;q=0.7, text/html;level=1, text/html;level=2;q=0.4, */*;q=0.5"', function () {
    beforeEach(function () {
      header = new Accept('text/*;q=0.3, text/html;q=0.7, text/html;level=1, text/html;level=2;q=0.4, */*;q=0.5');
    });

    it('has the correct quality factors', function () {
      expect(header.qualityFactorForMediaType('text/html;level=1')).toEqual(1);
      expect(header.qualityFactorForMediaType('text/html')).toEqual(0.7);
      expect(header.qualityFactorForMediaType('text/plain')).toEqual(0.3);
      expect(header.qualityFactorForMediaType('image/jpeg')).toEqual(0.5);
      expect(header.qualityFactorForMediaType('text/html;level=2')).toEqual(0.4);
      expect(header.qualityFactorForMediaType('text/html;level=3')).toEqual(0.7);
    });
  });
});
