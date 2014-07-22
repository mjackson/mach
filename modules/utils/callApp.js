var parseURL = require('./parseURL');
var stringifyQuery = require('./stringifyQuery');
var Request = require('../Request');

function callApp(app, options) {
  options = options || {};

  // If options is a string it specifies a URL.
  if (typeof options === 'string') {
    var url = parseURL(options);

    options = {
      protocol: url.protocol,
      serverName: url.hostname,
      serverPort: url.port,
      pathInfo: url.pathname,
      queryString: url.query
    };
  }

  // Params may be given as an object.
  if (options.params) {
    var queryString = stringifyQuery(options.params);

    if (options.method === 'POST' || options.method === 'PUT') {
      if (!options.headers)
        options.headers = {};

      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      options.content = queryString;
    } else {
      options.queryString = queryString;
      options.content = '';
    }

    delete options.params;
  }

  var request = new Request(options);

  return request.call(app);
}

module.exports = callApp;
