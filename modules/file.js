var fs = require('fs');
var Promise = require('./utils/Promise');
var defaultApp = require('./utils/defaultApp');
var getFileStats = require('./utils/getFileStats');
var joinPaths = require('./utils/joinPaths');
require('./server');

/**
 * A middleware for serving files efficiently from the file system according
 * to the path specified in the `pathInfo` request variable. Options may be
 * any of the following:
 *
 * - root               The path to the root directory to serve files from
 * - index              An array of file names to try and serve when the
 *                      request targets a directory (e.g. ["index.html", "index.htm"]).
 *                      May simply be truthy to use ["index.html"]
 * - useLastModified    Set this true to include the Last-Modified header
 *                      based on the mtime of the file. Defaults to true
 * - useETag            Set this true to include the ETag header based on
 *                      the MD5 checksum of the file. Defaults to false
 *
 * If a matching file cannot be found, the request is forwarded to the
 * downstream app. Otherwise, the file is streamed through to the response.
 */
function file(app, options) {
  options = options || {};
  app = app || defaultApp;

  if (typeof options === 'string')
    options = { root: options };

  var rootDirectory = options.root;
  if (typeof rootDirectory !== 'string' || !fs.existsSync(rootDirectory) || !fs.statSync(rootDirectory).isDirectory())
    throw new Error('Invalid root directory: ' + rootDirectory);

  var indexFiles = options.index;
  if (indexFiles) {
    if (typeof indexFiles === 'string') {
      indexFiles = [ indexFiles ];
    } else if (!Array.isArray(indexFiles)) {
      indexFiles = [ 'index.html' ];
    }
  }

  var useLastModified = ('useLastModified' in options) ? !!options.useLastModified : true;
  var useETag = !!options.useETag;

  function makeOptions(path) {
    return {
      path: path,
      useLastModified: useLastModified,
      useETag: useETag
    };
  }

  return function (conn) {
    if (conn.method !== 'GET' && conn.method !== 'HEAD')
      return conn.call(app);

    var pathname = conn.pathname;

    // Reject paths that contain "..".
    if (pathname.indexOf('..') !== -1)
      return conn.text(403, 'Forbidden');

    var path = joinPaths(rootDirectory, pathname);

    return getFileStats(path).then(function (stats) {
      if (stats && stats.isFile())
        return conn.file(makeOptions(path), stats);

      if (!stats || (!stats.isDirectory() || !indexFiles))
        return conn.call(app);

      // Try to serve one of the index files.
      var indexPaths = indexFiles.map(function (indexPath) {
        return joinPaths(path, indexPath);
      });

      return Promise.all(indexPaths.map(getFileStats)).then(function (stats) {
        for (var i = 0, len = stats.length; i < len; ++i)
          if (stats[i])
            return conn.file(makeOptions(indexPaths[i]), stats[i]);

        return conn.call(app);
      });
    });
  };
}

module.exports = file;
