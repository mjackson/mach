/* jshint -W058 */
var assert = require('assert');
var expect = require('expect');
var AcceptLanguage = require('../AcceptLanguage');

describe('AcceptLanguage', function () {
  var header;

  describe('with no value', function () {
    beforeEach(function () {
      header = new AcceptLanguage;
    });

    it('has the correct toString representation', function () {
      expect(header.toString()).toEqual('Accept-Language: ');
    });
    
    it('has the correct quality factors', function () {
      expect(header.qualityFactorForLanguage('en')).toEqual(1);
    });

    it('accepts en', function () {
      assert(header.accepts('en'));
    });
  });

  describe('with a value of "en;q=0.5, en-gb"', function () {
    beforeEach(function () {
      header = new AcceptLanguage('en;q=0.5, en-gb');
    });

    it('has the correct quality factors', function () {
      expect(header.qualityFactorForLanguage('en')).toEqual(0.5);
      expect(header.qualityFactorForLanguage('en-gb')).toEqual(1);
      expect(header.qualityFactorForLanguage('da')).toEqual(0);
    });

    it('accepts en', function () {
      assert(header.accepts('en'));
    });

    it('accepts en-gb', function () {
      assert(header.accepts('en-gb'));
    });

    it('does not accept da', function () {
      assert(!header.accepts('da'));
    });
  });
});
