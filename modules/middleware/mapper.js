var defaultApp = require('../index').defaultApp;
var escapeRegExp = require('../utils/escapeRegExp');

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
 *   mach.serve(app);
 *
 * Note: Dispatch is done in such a way that the longest paths are tried first
 * since they are the most specific.
 */
function Mapper(app) {
  if (!(this instanceof Mapper))
    return new Mapper(app);
  
  this._app = app || defaultApp;
  this._mappings = [];
}

Mapper.prototype.call = function (request) {
  var mappings = this._mappings;
  var scriptName = request.scriptName;
  var pathInfo = request.pathInfo;
  var host = request.host;

  var mapping, match, remainingPath;
  for (var i = 0, len = mappings.length; i < len; ++i) {
    mapping = mappings[i];

    // Try to match the host.
    if (mapping.host && mapping.host !== host)
      continue;

    // Try to match the path.
    if (!(match = pathInfo.match(mapping.pattern))) 
      continue;

    // Skip if the remaining path doesn't start with a "/".
    remainingPath = match[1];
    if (remainingPath.length > 0 && remainingPath[0] !== '/')
      continue;

    request.scriptName = scriptName + mapping.path;
    request.pathInfo = remainingPath;

    return request.call(mapping.app);
  }

  return request.call(this._app);
};

/**
 * Sets the given app as the default for this mapper.
 */
Mapper.prototype.run = function (app) {
  this._app = app;
};

/**
 * Adds a new mapping that runs the given app when the location used in the
 * request matches the given location.
 */
Mapper.prototype.map = function (location, app) {
  var host, path;

  // If the path is a fully qualified URL use the host as well.
  var match = location.match(/^https?:\/\/(.*?)(\/.*)/);
  if (match) {
    host = match[1];
    path = match[2];
  } else {
    path = location;
  }

  if (path.charAt(0) !== '/')
    throw new Error('Path must start with "/", was "' + path + '"');

  path = path.replace(/\/$/, '');

  var mappings = this._mappings;
  var pattern = new RegExp('^' + escapeRegExp(path).replace(/\/+/g, '/+') + '(.*)');

  mappings.push({
    host: host,
    path: path,
    pattern: pattern,
    app: app
  });

  mappings.sort(byMostSpecific);
};

function byMostSpecific(a, b) {
  return (b.path.length - a.path.length) || ((b.host || '').length - (a.host || '').length);
}

module.exports = Mapper;
