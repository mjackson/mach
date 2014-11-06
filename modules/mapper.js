var d = require('d');
var defaultApp = require('./utils/defaultApp');
var escapeRegExp = require('./utils/escapeRegExp');

function byMostSpecific(a, b) {
  return (b.path.length - a.path.length) || ((b.host || '').length - (a.host || '').length);
}

/**
 * A middleware that provides host and/or location-based routing. Modifies the
 * `basename` and `pathInfo` request variables for all downstream apps such
 * that the part relevant for dispatch is in `basename` and the rest in
 * `pathInfo`.
 *
 *   var app = mach.mapper();
 *
 *   app.map('http://example.com/images', function (request) {
 *     // The hostname used in the request was example.com, and the path
 *     // started with "/images".
 *   });
 *
 *   app.map('/images', function (request) {
 *     // The request path started with "/images".
 *   });
 *
 *   mach.serve(app);
 *
 * Note: Dispatch is done in such a way that the longest paths are tried first
 * since they are the most specific.
 */
function mapper(app) {
  app = app || defaultApp;
  
  var mappings = [];

  function callMapper(conn) {
    var pathname = conn.pathname;
    var host = conn.host;

    var mapping, match, remainingPath;
    for (var i = 0, len = mappings.length; i < len; ++i) {
      mapping = mappings[i];

      // Try to match the host.
      if (mapping.host && mapping.host !== host)
        continue;

      // Try to match the path.
      if (!(match = pathname.match(mapping.pattern))) 
        continue;

      // Skip if the remaining path doesn't start with a "/".
      remainingPath = match[1];
      if (remainingPath.length > 0 && remainingPath[0] !== '/')
        continue;

      conn.basename += mapping.path;

      return conn.call(mapping.app);
    }

    return conn.call(app);
  }

  Object.defineProperties(callMapper, {

    /**
     * Sets the given app as the default for this mapper.
     */
    run: d(function (downstreamApp) {
      app = downstreamApp;
    }),

    /**
     * Adds a new mapping that runs the given app when the location used in the
     * request matches the given location.
     */
    map: d(function (location, app) {
      app = app || defaultApp;

      var host, path;

      // If the location is a fully qualified URL use the host as well.
      var match = location.match(/^https?:\/\/(.*?)(\/.*)/);
      if (match) {
        host = match[1];
        path = match[2];
      } else {
        path = location;
      }

      if (path.charAt(0) !== '/')
        throw new Error('Mapping path must start with "/", was "' + path + '"');

      path = path.replace(/\/$/, '');

      var pattern = new RegExp('^' + escapeRegExp(path).replace(/\/+/g, '/+') + '(.*)');

      mappings.push({
        host: host,
        path: path,
        pattern: pattern,
        app: app
      });

      mappings.sort(byMostSpecific);
    })

  });

  return callMapper;
}

module.exports = mapper;
