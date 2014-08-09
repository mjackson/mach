function stringifyURL(options) {
  var protocol = options.protocol;
  var host = options.host;

  if (!host) {
    host = options.hostname;

    var port = options.port;

    if (port && (protocol === 'http:' && port != 80 || protocol === 'https:' && port != 443))
      host += ':' + port;
  }

  return protocol + '//' + host + options.path;
}

module.exports = stringifyURL;
