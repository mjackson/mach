var utils = require('./utils');

module.exports = mapperMiddleware;

/**
 * A middleware that provides host and/or location-based routing. Modifies the
 * `scriptName` and `pathInfo` request variables for all downstream apps such
 * that the part relevant for dispatch is in `scriptName` and the rest in
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
 * Note: Dispatch is done in such a way that the longest paths are tried first
 * since they are the most specific.
 */
function mapperMiddleware(defaultApp) {
  defaultApp = defaultApp || utils.defaultApp;

  var mappings = [];

  function mapper(request) {
    var scriptName = request.scriptName;
    var pathInfo = request.pathInfo;
    var host = request.host;

    var mapping, match, remainingPath;
    for (var i = 0, len = mappings.length; i < len; ++i) {
      mapping = mappings[i];

      // Try to match the host.
      if (mapping.host && mapping.host !== host) continue;

      // Try to match the path.
      match = pathInfo.match(mapping.matcher);
      if (!match) continue;
      remainingPath = match[1];

      // Skip if the remaining path doesn't start with a "/".
      if (remainingPath.length > 0 && remainingPath[0] != '/') continue;

      // Adjust scriptName and pathInfo for downstream apps.
      request.scriptName = scriptName + mapping.path;
      request.pathInfo = remainingPath;

      return request.call(mapping.app).then(function (response) {
        // Reset scriptName and pathInfo for upstream apps.
        request.scriptName = scriptName;
        request.pathInfo = pathInfo;

        return response;
      });
    }

    return request.call(defaultApp);
  }

  /**
   * Sets the given app as the default for this mapper.
   */
  mapper.run = function (app) {
    defaultApp = app;
  };

  /**
   * Adds a new mapping that runs the given app when the beginning of the path
   * used in the request matches the given path.
   */
  mapper.map = function (path, app) {
    var host;

    // If the path is a fully qualified URL use the host as well.
    var match = path.match(/^https?:\/\/(.*?)(\/.*)/);
    if (match) {
      host = match[1];
      path = match[2];
    }

    if (path.charAt(0) != '/') {
      throw new Error('Path must start with "/", was "' + path + '"');
    }

    path = path.replace(/\/$/, '');

    var pattern = utils.escapeRegExp(path).replace(/\/+/g, '/+');
    var matcher = new RegExp('^' + pattern + '(.*)');

    mappings.push({
      host: host,
      path: path,
      matcher: matcher,
      app: app
    });

    // Keep mappings sorted by most specific (longest first).
    mappings.sort(function (a, b) {
      return (b.path.length - a.path.length) || ((b.host || '').length - (a.host || '').length);
    });
  };

  return mapper;
}
