/* jshint -W058 */
var expect = require('expect');
var mach = require('../../index');
var StatusCodes = require('../../StatusCodes');

describe('extensions/statusText', function () {

  beforeEach(function () {
    mach.extend(require('../statusText'));
  });

  describe('Connection#statusText', function () {

    var conn;
    beforeEach(function () {
      conn = new mach.Connection;
    });

    Object.keys(StatusCodes).forEach(function (status) {
      describe('with status ' + status, function () {
        beforeEach(function () {
          conn.status = status;
        });

        it('has the correct statusText', function () {
          expect(conn.statusText).toEqual(status + ' ' + StatusCodes[status]);
        });
      });
    });

  });

});
