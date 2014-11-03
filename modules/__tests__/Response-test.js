require('./helper');
var StatusCodes = require('../utils/StatusCodes');
var Response = mach.Response;

describe('Response', function () {

  Object.keys(StatusCodes).forEach(function (status) {
    describe('with status ' + status, function () {
      var response;
      beforeEach(function () {
        response = new Response({ status: status });
      });

      it('has the correct statusText', function () {
        expect(response.statusText).toEqual(StatusCodes[status]);
      });
    });
  });

});
