/* jshint -W058 */
var assert = require('assert');
var expect = require('expect');
var AcceptEncoding = require('../AcceptEncoding');

describe('AcceptEncoding', function () {
  var header;

  describe('with no value', function () {
    beforeEach(function () {
      header = new AcceptEncoding;
    });

    it('has the correct toString representation', function () {
      expect(header.toString()).toEqual('Accept-Encoding: ');
    });
    
    it('has the correct quality factors', function () {
      expect(header.qualityFactorForEncoding('identity')).toEqual(1);
      expect(header.qualityFactorForEncoding('compress')).toEqual(0);
      expect(header.qualityFactorForEncoding('gzip')).toEqual(0);
    });

    it('accepts identity', function () {
      assert(header.accepts('identity'));
    });

    it('does not accept other encodings', function () {
      assert(!header.accepts('compress'));
      assert(!header.accepts('gzip'));
    });
  });

  describe('with a value of "*;q=0"', function () {
    beforeEach(function () {
      header = new AcceptEncoding('*;q=0');
    });

    it('has the correct quality factors', function () {
      expect(header.qualityFactorForEncoding('identity')).toEqual(1);
      expect(header.qualityFactorForEncoding('compress')).toEqual(0);
      expect(header.qualityFactorForEncoding('gzip')).toEqual(0);
    });
 
    it('accepts identity', function () {
      assert(header.accepts('identity'));
    });

    it('does not accept other encodings', function () {
      assert(!header.accepts('compress'));
      assert(!header.accepts('gzip'));
    });
  });

  describe('with a value of "gzip, *;q=0.5"', function () {
    beforeEach(function () {
      header = new AcceptEncoding('gzip, *;q=0.5');
    });

    it('has the correct quality factors', function () {
      expect(header.qualityFactorForEncoding('identity')).toEqual(1);
      expect(header.qualityFactorForEncoding('gzip')).toEqual(1);
      expect(header.qualityFactorForEncoding('compress')).toEqual(0.5);
    });

    it('accepts identity', function () {
      assert(header.accepts('identity'));
    });

    it('accepts gzip', function () {
      assert(header.accepts('gzip'));
    });

    it('accepts compress', function () {
      assert(header.accepts('compress'));
    });
  });
});
