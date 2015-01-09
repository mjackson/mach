/* jshint -W058 */
var expect = require('expect');
var Location = require('../Location');

describe('an empty Location', function () {
  var location;
  beforeEach(function () {
    location = new Location;
  });

  it('has the correct href', function () {
    expect(location.href).toEqual('/');
  });
});

describe('a fully-specified Location', function () {

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

  describe('with http: protocol on the standard port', function () {
    it('leaves the port # out of host', function () {
      var location = new Location('http://example.com:80/the/path');
      expect(location.host).toEqual('example.com');
    });
  });

  describe('with http: protocol on a non-standard port', function () {
    it('includes the port # in host', function () {
      var location = new Location('http://example.com:8080/the/path');
      expect(location.host).toEqual('example.com:8080');
    });
  });

  describe('with https: protocol on the standard port', function () {
    it('leaves the port # out of host', function () {
      var location = new Location('https://example.com:443/the/path');
      expect(location.host).toEqual('example.com');
    });
  });

  describe('with https: protocol on a non-standard port', function () {
    it('includes the port # in host', function () {
      var location = new Location('https://example.com:5000/the/path');
      expect(location.host).toEqual('example.com:5000');
    });
  });

  describe('when the href is set', function () {
    it('has the correct href', function () {
      location.href = 'https://user:pass@example.net/another/path?another=query';
      expect(location.href).toEqual('https://user:pass@example.net/another/path?another=query');
    });
  });

  describe('when the protocol is set', function () {
    it('has the correct href', function () {
      location.protocol = 'https:';
      expect(location.href).toEqual('https://user:pass@example.com:5000/the/path?the=query');
    });
  });

  describe('when the hostname is set', function () {
    it('has the correct href', function () {
      location.hostname = 'example.net';
      expect(location.href).toEqual('http://user:pass@example.net:5000/the/path?the=query');
    });
  });

  describe('when the host is set', function () {
    describe('with a port', function () {
      it('has the correct href', function () {
        location.host = 'example.net:8080';
        expect(location.href).toEqual('http://user:pass@example.net:8080/the/path?the=query');
      });
    });

    describe('without a port', function () {
      it('has the correct href', function () {
        location.host = 'example.net';
        expect(location.href).toEqual('http://user:pass@example.net/the/path?the=query');
      });
    });
  });

  describe('when the port is set', function () {
    it('has the correct href', function () {
      location.port = 6000;
      expect(location.href).toEqual('http://user:pass@example.com:6000/the/path?the=query');
    });
  });

  describe('when the pathname is set', function () {
    it('has the correct href', function () {
      location.pathname = '/another/path';
      expect(location.href).toEqual('http://user:pass@example.com:5000/another/path?the=query');
    });
  });

  describe('when the path is set', function () {
    describe('with a search', function () {
      it('has the correct href', function () {
        location.path = '/another/path?another=query';
        expect(location.href).toEqual('http://user:pass@example.com:5000/another/path?another=query');
      });
    });

    describe('without a search', function () {
      it('has the correct href', function () {
        location.path = '/another/path';
        expect(location.href).toEqual('http://user:pass@example.com:5000/another/path');
      });
    });
  });

  describe('when the search is set', function () {
    it('has the correct href', function () {
      location.search = '?another=query';
      expect(location.href).toEqual('http://user:pass@example.com:5000/the/path?another=query');
    });
  });

  describe('when the queryString is set', function () {
    it('has the correct href', function () {
      location.queryString = 'another=query';
      expect(location.href).toEqual('http://user:pass@example.com:5000/the/path?another=query');
    });
  });

  describe('when the query is set', function () {
    it('has the correct href', function () {
      location.query = { another: 'query' };
      expect(location.href).toEqual('http://user:pass@example.com:5000/the/path?another=query');
    });
  });

  describe('when appending another location', function () {
    beforeEach(function () {
      location = location.concat('https://example.org/more/path?more=query');
    });

    it('uses the new protocol', function () {
      expect(location.protocol).toEqual('https:');
    });

    it('uses the new host', function () {
      expect(location.host).toEqual('example.org');
    });

    it('has the correct pathname', function () {
      expect(location.pathname).toEqual('/the/path/more/path');
    });

    it('has the correct query', function () {
      expect(location.query).toEqual({ the: 'query', more: 'query' });
    });
  });

});

describe('a Location with only a path', function () {

  var location;
  beforeEach(function () {
    location = new Location('/the/path?the=query');
  });

  it('has no protocol', function () {
    expect(location.protocol).toBe(null);
  });

  it('has no hostname', function () {
    expect(location.hostname).toBe(null);
  });

  it('has no port', function () {
    expect(location.port).toBe(null);
  });

  it('has no host', function () {
    expect(location.host).toBe(null);
  });

  it('has the correct pathname', function () {
    expect(location.pathname).toEqual('/the/path');
  });

  it('has the correct query', function () {
    expect(location.query).toEqual({ the: 'query' });
  });

});

describe('a Location with no search', function () {

  var location;
  beforeEach(function () {
    location = new Location('/the/path');
  });

  it('has an empty search', function () {
    expect(location.search).toEqual('');
  });

  it('has an empty queryString', function () {
    expect(location.queryString).toEqual('');
  });

  it('has an empty query', function () {
    expect(location.query).toEqual({});
  });

});
