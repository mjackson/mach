var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var when = require('when');
var utils = require('./utils');

/**
 * A middleware for serving files efficiently from the file system according
 * to the path specified in the `pathInfo` request variable. Options may be
 * any of the following:
 *
 *   - root               The path to the root directory to serve files from
 *   - index              An array of file names to try and serve when the
 *                        request targets a directory (e.g. ["index.html", "index.htm"])
 *   - useLastModified    Set this true to include the Last-Modified header
 *                        based on the mtime of the file. Defaults to true
 *   - useEtag            Set this true to include the ETag header based on
 *                        the MD5 checksum of the file. Defaults to false
 *
 * If a matching file cannot be found, the request is forwarded to the
 * downstream app. Otherwise, the file is streamed through to the response.
 */
module.exports = function (app, options) {
  if (typeof app !== 'function') {
    options = app;
    app = utils.defaultApp;
  }

  var root, index, useLastModified, useEtag;
  if (typeof options === 'string') {
    root = options;
    useLastModified = true;
    useEtag = false;
  } else if (options) {
    root = options.root;
    index = options.index;
    if ('useLastModified' in options) {
      useLastModified = !!options.useLastModified;
    } else {
      useLastModified = true;
    }
    useEtag = !!options.useEtag;
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

  if (index) {
    if (typeof index === 'string') {
      index = [ index ];
    } else if (!Array.isArray(index)) {
      index = [ 'index.html' ];
    }
  }

  function fileServer(request) {
    var method = request.method;
    if (method !== 'GET' && method !== 'HEAD') {
      return request.call(app);
    }

    var pathInfo = request.pathInfo;
    if (pathInfo.indexOf('..') !== -1) {
      return utils.forbidden();
    }

    var fullPath = path.join(root, pathInfo);

    return findFile(fullPath).then(function (stat) {
      if (!stat) {
        return request.call(app);
      }

      if (stat.isFile()) {
        return sendFile(fullPath, stat, useLastModified, useEtag);
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
              return sendFile(indexPaths[i], stats[i], useLastModified, useEtag);
            }
          }

          return request.call(app);
        });
      }

      return request.call(app);
    });
  }

  return fileServer;
};

var statFile = require('when/node/function').lift(fs.stat);

// Attempt to get a stat for the given file. Return null if it does not exist.
function findFile(file) {
  return statFile(file).then(null, function (error) {
    if (error.code === 'ENOENT') {
      return null;
    }

    throw error;
  });
}

function sendFile(file, stat, useLastModified, useEtag) {
  var response = {
    status: 200,
    headers: {
      'Content-Type': utils.mimeType(file),
      'Content-Length': stat.size
    },
    content: fs.createReadStream(file)
  };

  if (useLastModified) {
    response.headers['Last-Modified'] = stat.mtime.toUTCString();
  }

  if (useEtag) {
    return utils.makeChecksum(file).then(function (checksum) {
      response.headers['ETag'] = checksum;
      return response;
    });
  }

  return response;
}
