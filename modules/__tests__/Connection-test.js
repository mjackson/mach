var expect = require('expect');
var StatusCodes = require('../StatusCodes');
var Connection = require('../Connection');

describe('Connection', function () {

  var conn;
  beforeEach(function () {
    conn = new Connection;
  });

  Object.keys(StatusCodes).forEach(function (status) {
    describe('with status ' + status, function () {
      beforeEach(function () {
        conn.status = status;
      });

      it('has the correct statusText', function () {
        expect(conn.statusText).toEqual(StatusCodes[status]);
      });
    });
  });

});
