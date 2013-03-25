var fs = require('fs');
var path = require('path');
var when = require('when');
var utils = require('./utils');

module.exports = file;

/**
 * A middleware for serving files efficiently from the given root directory
 * according to path specified in the `pathInfo` request variable.
 *
 * The `index` argument specifies what file will be served if the request
 * targets a directory. It may be a single filename (e.g. "index.html") or an
 * array of names to be tried in order (e.g. ["index.html", "index.htm"]).
 *
 * If a matching file cannot be found, the request is forwarded to the
 * downstream app. Otherwise, the file is streamed through to the response.
 */
function file(app, root, index) {
  if (typeof app !== 'function') {
    index = root;
    root = app;
    app = utils.defaultApp;
  }

  if (typeof root !== 'string') {
    throw new Error('Invalid root directory');
  }

  if (!fs.existsSync(root)) {
    throw new Error('Directory "' + root + '" does not exist');
  }

  if (!fs.statSync(root).isDirectory()) {
    throw new Error('"' + root + '" is not a directory');
  }

  if (index && typeof index === 'string') {
    index = [index];
  }

  return function (request) {
    if (request.method !== 'GET') return request.call(app);

    var pathInfo = request.pathInfo;
    if (pathInfo.indexOf('..') !== -1) return utils.forbidden();

    var fullPath = path.join(root, pathInfo);

    return findFile(fullPath).then(function (stat) {
      if (!stat) {
        return request.call(app);
      }

      if (stat.isFile()) {
        return sendFile(fullPath, stat);
      }

      // If the request targets a directory check all index
      // files to see if we can serve any of them.
      if (stat.isDirectory() && index) {
        var indexPaths = index.map(function (file) {
          return path.join(fullPath, file);
        });

        return when.all(indexPaths.map(findFile)).then(function (stats) {
          for (var i = 0, len = stats.length; i < len; ++i) {
            if (stats[i]) {
              return sendFile(indexPaths[i], stats[i]);
            }
          }

          return request.call(app);
        });
      }

      return request.call(app);
    });
  };
}

function sendFile(file, stat) {
  return {
    status: 200,
    headers: {
      'Content-Type': utils.mimeType(file),
      'Content-Length': stat.size,
      'Last-Modified': stat.mtime.toUTCString()
    },
    content: fs.createReadStream(file)
  };
}

// Attempt to get a stat for the given file. Return null if it
// does not exist.
function findFile(file) {
  return utils.statFile(file).then(null, function (error) {
    if (isMissingFileError(error)) {
      return null;
    }

    throw error;
  });
}


function isMissingFileError(error) {
  return error.code === 'ENOENT';
}
