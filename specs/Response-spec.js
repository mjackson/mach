require('./helper');
var statusCodes = require('../modules/utils/statusCodes');
var Response = mach.Response;

describe('Response', function () {

  Object.keys(statusCodes).forEach(function (status) {
    describe('with status ' + status, function () {
      var response;
      beforeEach(function () {
        response = new Response({ status: status });
      });

      it('has the correct statusText', function () {
        expect(response.statusText).toEqual(statusCodes[status]);
      });
    });
  });

});
