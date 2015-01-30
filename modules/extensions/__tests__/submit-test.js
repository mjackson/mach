var expect = require('expect');
var mach = require('../../index');

describe('extensions/submit', function () {

  beforeEach(function () {
    mach.extend(require('../submit'));
  });

  describe('mach.submit', function () {
    it('is a function', function () {
      expect(mach.submit).toBeA('function');
    });
  });
  
});
