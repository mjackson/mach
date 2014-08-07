var fs = require('fs');
var d = require('d');
var Promise = require('bluebird');
var getFileChecksum = require('./utils/getFileChecksum');
var getFileStats = require('./utils/getFileStats');
var getMimeType = require('./utils/getMimeType');

module.exports = {

  /**
   * Sends a file to the client with the given options.
   */
  sendFile: d(function (status, options, stats) {
    if (typeof status !== 'number') {
      stats = options;
      options = status;
    } else {
      this.status = status;
    }

    if (typeof options === 'string')
      options = { path: options, useLastModified: true };

    var response = this;

    return Promise.resolve(stats || getFileStats(options.path)).then(function (stats) {
      if (!stats.isFile())
        throw new Error('Cannot sendFile ' + options.path + '; it is not a file');

      response.status = status;
      response.content = fs.createReadStream(options.path);
      response.headers['Content-Type'] = getMimeType(options.path);
      response.headers['Content-Length'] = stats.size;

      if (options.useLastModified)
        response.headers['Last-Modified'] = stats.mtime.toUTCString();

      if (!options.useETag)
        return response;

      return getFileChecksum(options.path).then(function (checksum) {
        response.headers['ETag'] = checksum;
        return response;
      });
    });
  })

};
