var expect = require('expect');
var Location = require('../Location');

describe('A new Location', function () {
  var location;
  beforeEach(function () {
    location = new Location('http://user:pass@example.com:5000/the/path?the=query');
  });

  it('has the correct href', function () {
    expect(location.href).toEqual('http://user:pass@example.com:5000/the/path?the=query');
  });

  it('has the correct protocol', function () {
    expect(location.protocol).toEqual('http:');
  });

  it('has the correct auth', function () {
    expect(location.auth).toEqual('user:pass');
  });

  it('has the correct host', function () {
    expect(location.host).toEqual('example.com:5000');
  });

  it('has the correct hostname', function () {
    expect(location.hostname).toEqual('example.com');
  });

  it('has the correct port', function () {
    expect(location.port).toEqual('5000');
  });

  it('has the correct pathname', function () {
    expect(location.pathname).toEqual('/the/path');
  });

  it('has the correct path', function () {
    expect(location.path).toEqual('/the/path?the=query');
  });

  it('has the correct search', function () {
    expect(location.search).toEqual('?the=query');
  });

  it('has the correct queryString', function () {
    expect(location.queryString).toEqual('the=query');
  });

  it('has the correct query', function () {
    expect(location.query).toEqual({ the: 'query' });
  });

  describe('with http: protocol on port 80', function () {
    it('leaves the protocol out of host', function () {
      var location = new Location('http://example.com:80/the/path');
      expect(location.host).toEqual('example.com');
    });
  });

  describe('with https: protocol on port 443', function () {
    it('leaves the protocol out of host', function () {
      var location = new Location('https://example.com:443/the/path');
      expect(location.host).toEqual('example.com');
    });
  });
});
