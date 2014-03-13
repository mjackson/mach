var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var RSVP = require('rsvp');
var utils = require('../utils');
module.exports = File;

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
function File(app, options) {
  if (!(this instanceof File))
    return new File(app, options);

  if (!utils.isApp(app)) {
    options = app;
    app = utils.defaultApp;
  }

  var root, indexFiles, useLastModified, useEtag;
  if (typeof options === 'string') {
    root = options;
    useLastModified = true;
    useEtag = false;
  } else if (options) {
    root = options.root;
    indexFiles = options.index;
    useLastModified = ('useLastModified' in options) ? !!options.useLastModified : true;
    useEtag = !!options.useEtag;
  }

  if (typeof root !== 'string' || !fs.existsSync(root) || !fs.statSync(root).isDirectory())
    throw new Error('Invalid root directory: ' + root);

  if (indexFiles) {
    if (typeof indexFiles === 'string') {
      indexFiles = [ indexFiles ];
    } else if (!Array.isArray(indexFiles)) {
      indexFiles = [ 'index.html' ];
    }
  }

  this._app = app;
  this._root = root;
  this._indexFiles = indexFiles;
  this._useLastModified = useLastModified;
  this._useEtag = useEtag;
}

File.prototype.apply = function (request) {
  var method = request.method;
  if (method !== 'GET' && method !== 'HEAD')
    return request.call(this._app);

  var pathInfo = request.pathInfo;
  if (pathInfo.indexOf('..') !== -1)
    return utils.forbidden();

  var fullPath = path.join(this._root, pathInfo);

  return findFile(fullPath).then(function (stat) {
    // If the request targets a file, send it!
    if (stat && stat.isFile())
      return this._sendFile(fullPath, stat);

    // If the request does not target a directory or we don't have any
    // index files to try, pass the request downstream.
    if (!stat || (!stat.isDirectory() || !this._indexFiles))
      return request.call(this._app);

    // The request targets a directory. Try all the index files in order
    // to see if we can serve any of them.
    var indexPaths = this._indexFiles.map(function (file) {
      return path.join(fullPath, file);
    });

    return RSVP.all(indexPaths.map(findFile)).then(function (stats) {
      for (var i = 0, len = stats.length; i < len; ++i) {
        if (stats[i])
          return this._sendFile(indexPaths[i], stats[i]);
      }

      return request.call(this._app);
    }.bind(this));
  }.bind(this));
};

File.prototype._sendFile = function (file, stat) {
  var response = {
    status: 200,
    headers: {
      'Content-Type': utils.mimeType(file),
      'Content-Length': stat.size
    },
    content: fs.createReadStream(file)
  };

  if (this._useLastModified)
    response.headers['Last-Modified'] = stat.mtime.toUTCString();

  if (!this._useEtag)
    return response;

  return utils.makeChecksum(file).then(function (checksum) {
    response.headers['ETag'] = checksum;
    return response;
  });
};

var statFile = RSVP.denodeify(fs.stat);

// Attempt to get a stat for the given file. Return null if it does not exist.
function findFile(file) {
  return statFile(file).then(undefined, function (error) {
    if (error.code === 'ENOENT')
      return null;

    throw error;
  });
}
