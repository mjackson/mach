var Content = require('./content');
module.exports = Part;

/**
 * A container class for data pertaining to one part of a multipart message.
 */
function Part() {
  this.headers = {};
  this.content = new Content;
}

Part.prototype.on = function () {
  console.warn('multipart.Part#on is deprecated and will not work in the next major release');
  return this.content.on.apply(this.content, arguments);
};

/**
 * Returns the Content-Type of this part.
 */
Part.prototype.__defineGetter__('type', function () {
  return this.headers['content-type'] || null;
});

/**
 * Returns the Content-Type with any extra parameters stripped
 * (e.g. "text/plain;charset=utf-8" becomes "text/plain").
 */
Part.prototype.__defineGetter__('mediaType', function () {
  return (this.type || '').split(/\s*[;,]\s*/)[0].toLowerCase();
});

/**
 * Returns the Content-Disposition of this part.
 */
Part.prototype.__defineGetter__('disposition', function () {
  return this.headers['content-disposition'] || null;
});

/**
 * Returns the name of this part.
 */
Part.prototype.__defineGetter__('name', function () {
  var disposition = this.disposition;

  var match;
  if (disposition && (match = disposition.match(/name="([^"]+)"/i))) {
    return match[1];
  }

  return this.headers['content-id'] || null;
});

/**
 * Returns the filename of this part if it originated from a file upload.
 */
Part.prototype.__defineGetter__('filename', function () {
  var disposition = this.disposition;

  if (disposition) {
    var match = disposition.match(/filename="([^;]*)"/i);

    var filename;
    if (match) {
      filename = decodeURIComponent(match[1].replace(/\\"/g, '"'));
    } else {
      // Match unquoted filename.
      match = disposition.match(/filename=([^;]+)/i);
      if (match) {
        filename = decodeURIComponent(match[1]);
      }
    }

    if (filename) {
      // Take the last part of the filename. This handles full Windows
      // paths given by IE (and possibly other dumb clients).
      return filename.substr(filename.lastIndexOf('\\') + 1);
    }
  }

  return null;
});

/**
 * Returns true if this part represents a file upload.
 */
Part.prototype.__defineGetter__('isFile', function () {
  return !!this.filename;
});
