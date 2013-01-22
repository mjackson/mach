var fs = require('fs');
var path = require('path');
var q = require('q');
var utils = require('./utils');

module.exports = fileMiddleware;

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
function fileMiddleware(app, root, index) {
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

  function file(request) {
    if (request.method !== 'GET') return request.call(app);

    var pathInfo = request.pathInfo;
    if (pathInfo.indexOf('..') !== -1) return utils.forbidden();

    var fullPath = path.join(root, pathInfo);

    return statFile(fullPath).then(function (stat) {
      if (stat.isFile()) {
        return sendFile(fullPath, stat);
      }

      // If the request targets a directory check all index
      // files to see if we can serve any of them.
      if (stat.isDirectory() && index) {
        var indexPaths = index.map(function (file) {
          return path.join(fullPath, file);
        });

        return q.allResolved(indexPaths.map(statFile)).then(function (indexStats) {
          var promise, error;
          for (var i = 0, len = indexStats.length; i < len; ++i) {
            promise = indexStats[i];
            if (promise.isRejected()) {
              // TODO: Is there a bug in q.allResolved that returns the promise
              // instead of the exception as valueOf for rejected promises?
              error = promise.valueOf().exception;
              if (!isMissingFileError(error)) throw error;
            } else {
              return sendFile(indexPaths[i], promise.valueOf());
            }
          }

          return request.call(app);
        });
      }

      return request.call(app);
    }, function (error) {
      if (!isMissingFileError(error)) throw error;
      return request.call(app);
    });
  }

  return file;
}

function sendFile(file, stat) {
  var content = fs.createReadStream(file);

  return {
    status: 200,
    headers: {
      'Content-Type': utils.mimeType(file),
      'Content-Length': stat.size,
      'Last-Modified': stat.mtime.toUTCString()
    },
    content: content
  };
}

function statFile(file) {
  return q.ninvoke(fs, 'stat', file);
}

function isMissingFileError(error) {
  return error.code === 'ENOENT';
}
