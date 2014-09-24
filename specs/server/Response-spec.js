require('./helper');
var Response = mach.Response;

describe('Response', function () {
  var response;
  beforeEach(function () {
    response = new Response;
  });

  describe('setCookie', function () {
    describe('when no cookies have been previously set', function () {
      it('sets the "Set-Cookie" header to the appropriate string', function () {
        response.setCookie('cookieName', {value: 'cookieValue'});

        expect(response.headers['Set-Cookie']).toEqual('cookieName=cookieValue');
      });
    });

    describe('when cookies have been previously set', function () {
      beforeEach(function () {
        response.setCookie('previousOne', {value: 'previousOneValue'});
      });

      it('sets the "Set-Cookie" header to an array of headers', function () {
        response.setCookie('cookieName', {value: 'cookieValue'});

        expect(response.headers['Set-Cookie']).toEqual([
          'previousOne=previousOneValue',
          'cookieName=cookieValue',
        ]);
      });

    });
  });
});
