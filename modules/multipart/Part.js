var d = require('describe-property');
var Message = require('../Message');

/**
 * Part of a multipart HTTP message.
 */
function Part() {
  Message.apply(this, arguments);
}

Part.prototype = Object.create(Message.prototype, {

  constructor: d(Part),

  /**
   * The value of the Content-Disposition header.
   */
  contentDisposition: d.gs(function () {
    return this.headers['Content-Disposition'];
  }),

  /**
   * The value of the Content-Id header.
   */
  contentID: d.gs(function () {
    return this.headers['Content-Id'];
  }),

  /**
   * The filename of this part. This is usually present on parts that
   * originated from a file upload.
   */
  filename: d.gs(function () {
    var contentDisposition = this.contentDisposition;

    if (contentDisposition) {
      var match = contentDisposition.match(/filename="([^;]*)"/i);

      var filename;
      if (match) {
        filename = decodeURIComponent(match[1].replace(/\\"/g, '"'));
      } else {
        // Match unquoted filename.
        match = contentDisposition.match(/filename=([^;]+)/i);

        if (match)
          filename = decodeURIComponent(match[1]);
      }

      if (filename) {
        // Take the last part of the filename. This handles full Windows
        // paths given by IE (and possibly other dumb clients).
        return filename.substr(filename.lastIndexOf('\\') + 1);
      }
    }
  }),

  /**
   * Returns true if this part represents a file upload.
   */
  isFile: d.gs(function () {
    return this.filename != null;
  }),

  /**
   * The name of this part.
   */
  name: d.gs(function () {
    var contentDisposition = this.contentDisposition;

    var match;
    if (contentDisposition && (match = contentDisposition.match(/\bname="([^"]+)"/i)))
      return match[1];

    return this.contentID;
  })

});

module.exports = Part;
