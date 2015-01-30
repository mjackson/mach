var expect = require('expect');
var Connection = require('../Connection');

describe('a Connection that uses https', function () {

  var conn;
  beforeEach(function () {
    conn = new Connection('https://www.example.com');
  });

  it('is secure', function () {
    expect(conn.isSSL).toBe(true);
  });

});
