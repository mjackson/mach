var d = require('d');
var Promise = require('bluebird');
var defaultApp = require('../index').defaultApp;
var sendText = require('../index').text;
var fileExists = require('../utils/fileExists');
var isDirectory = require('../utils/isDirectory');
var makeChecksum = require('../utils/makeChecksum');
var mimeType = require('../utils/mimeType');
var statFile = require('../utils/statFile');

/**
 * A middleware for serving files efficiently from the file system according
 * to the path specified in the `pathInfo` request variable. Options may be
 * any of the following:
 *
 *   - root               The path to the root directory to serve files from
 *   - index              An array of file names to try and serve when the
 *                        request targets a directory (e.g. ["index.html", "index.htm"]).
 *                        May simply be truthy to use ["index.html"]
 *   - useLastModified    Set this true to include the Last-Modified header
 *                        based on the mtime of the file. Defaults to true
 *   - useEtag            Set this true to include the ETag header based on
 *                        the MD5 checksum of the file. Defaults to false
 *
 * If a matching file cannot be found, the request is forwarded to the
 * downstream app. Otherwise, the file is streamed through to the response.
 */
function File(app, options) {
  if (!(this instanceof File))
    return new File(app, options);

  if (typeof options === 'string')
    options = { root: options };

  var rootDirectory = options.root;
  if (typeof rootDirectory !== 'string' || !fileExists(rootDirectory) || !isDirectory(rootDirectory))
    throw new Error('Invalid root directory: ' + rootDirectory);

  var indexFiles = options.index;
  if (indexFiles) {
    if (typeof indexFiles === 'string') {
      indexFiles = [ indexFiles ];
    } else if (!Array.isArray(indexFiles)) {
      indexFiles = [ 'index.html' ];
    }
  }

  this._app = app || defaultApp;
  this._rootDirectory = rootDirectory;
  this._indexFiles = indexFiles;
  this._useLastModified = ('useLastModified' in options) ? !!options.useLastModified : true;
  this._useEtag = !!options.useEtag;
}

var fs = require('fs');
var path = require('path');

Object.defineProperties(File.prototype, {

  call: d(function (request) {
    var method = request.method;
    if (method !== 'GET' && method !== 'HEAD')
      return request.call(this._app);

    var pathInfo = request.pathInfo;
    if (pathInfo.indexOf('..') !== -1)
      return sendText('Forbidden', 403);

    var fullPath = path.join(this._rootDirectory, pathInfo);
    var self = this;

    return findFile(fullPath).then(function (stat) {
      // If the request targets a file, send it!
      if (stat && stat.isFile())
        return self.sendFile(fullPath, stat);

      // If the request does not target a directory or we don't have any
      // index files to try, pass the request downstream.
      if (!stat || (!stat.isDirectory() || !self._indexFiles))
        return request.call(self._app);

      // The request targets a directory. Try all the index files in order
      // to see if we can serve any of them.
      var indexPaths = self._indexFiles.map(function (file) {
        return path.join(fullPath, file);
      });

      return Promise.all(indexPaths.map(findFile)).then(function (stats) {
        for (var i = 0, len = stats.length; i < len; ++i) {
          if (stats[i])
            return self.sendFile(indexPaths[i], stats[i]);
        }

        return request.call(self._app);
      });
    });
  }),

  sendFile: d(function (file, stat) {
    var response = {
      status: 200,
      headers: {
        'Content-Type': mimeType(file),
        'Content-Length': stat.size
      },
      content: fs.createReadStream(file)
    };

    if (this._useLastModified)
      response.headers['Last-Modified'] = stat.mtime.toUTCString();

    if (!this._useEtag)
      return response;

    return makeChecksum(file).then(function (checksum) {
      response.headers['ETag'] = checksum;
      return response;
    });
  })

});

// Attempt to get a stat for the given file. Return null if it does not exist.
function findFile(file) {
  return statFile(file).then(undefined, function (error) {
    if (error.cause.code === 'ENOENT')
      return null;

    throw error;
  });
}

module.exports = File;
