var d = require('d');
var streamPartToDisk = require('../utils/streamPartToDisk');

var _handlePart = require('../Message').prototype.handlePart;

module.exports = {

  /**
   * Enables streaming file uploads to disk when parsing
   * multipart messages.
   */
  handlePart: d(function (part, uploadPrefix) {
    if (part.isFile)
      return streamPartToDisk(part, uploadPrefix);

    return _handlePart.apply(this, arguments);
  })

};
