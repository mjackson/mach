require('./helper');

var compileRoute = mach.utils.compileRoute;

describe('compileRoute', function () {
  var keys;
  beforeEach(function () {
    keys = [];
  });

  describe('when a pattern contains named keys', function () {
    it('populates the keys array with the values', function () {
      compileRoute('/users/:userID/posts/:postID', keys);
      expect(keys).toEqual([ 'userID', 'postID' ]);
    });
  });

  describe('when a pattern contains *s', function () {
    it('has splat keys', function () {
      compileRoute('/files/*.*', keys);
      expect(keys).toEqual([ 'splat', 'splat' ]);
    });

    it('matches correctly', function () {
      var re = compileRoute('/files/*.*', keys);
      assert(re.exec('/files/fun.jpg'));
      refute(re.exec('/files/fun'));
    });
  });

  describe('a pattern with ()', function () {
    it('has the correct keys', function () {
      compileRoute('/users/(:userID)', keys);
      expect(keys).toEqual([ 'userID' ]);
    });

    it('matches correctly', function () {
      var re = compileRoute('/users/(:userID)', keys);
      refute(re.exec('/users/5'));
      assert(re.exec('/users/(5)'));
    });
  });
});
