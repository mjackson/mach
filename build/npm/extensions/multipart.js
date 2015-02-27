"use strict";

var d = require("describe-property");
var parseContent = require("../multipart/parseContent");

var BOUNDARY_MATCHER = /^multipart\/.*boundary=(?:"([^"]+)"|([^;]+))/im;
var NAME_MATCHER = /\bname="([^"]+)"/i;

module.exports = function (mach) {
  mach.Message.PARSERS["multipart/form-data"] = function (message, maxLength) {
    function partHandler(part) {
      return message.handlePart(part);
    }

    // If the content has been buffered, use the buffer.
    if (message.isBuffered) {
      return message.bufferContent().then(function (content) {
        return parseContent(content, message.multipartBoundary, maxLength, partHandler);
      });
    }

    return parseContent(message.content, message.multipartBoundary, maxLength, partHandler);
  };

  Object.defineProperties(mach.Message.prototype, {

    /**
     * The value that was used as the boundary for multipart content. This
     * is present only in multipart messages.
     */
    multipartBoundary: d.gs(function () {
      var contentType = this.contentType,
          match;
      return contentType && (match = contentType.match(BOUNDARY_MATCHER)) ? match[1] || match[2] : null;
    }),

    /**
     * The unique "name" or ID of this message, as given in its Content-Disposition
     * header. This is usually present only on messages that are part of a larger,
     * multipart message.
     */
    name: d.gs(function () {
      var contentDisposition = this.headers["Content-Disposition"],
          match;
      return contentDisposition && (match = contentDisposition.match(NAME_MATCHER)) ? match[1] : this.headers["Content-ID"];
    }),

    /**
     * The filename of this message, as given in its Content-Disposition header.
     * This is usually present only on messages that are part of a larger, multipart
     * message and that originate from a file upload.
     */
    filename: d.gs(function () {
      var contentDisposition = this.headers["Content-Disposition"];

      if (contentDisposition) {
        // Match quoted filenames.
        var match = contentDisposition.match(/filename="([^;]*)"/i);

        var filename;
        if (match) {
          filename = decodeURIComponent(match[1].replace(/\\"/g, "\""));
        } else {
          // Match unquoted filenames.
          match = contentDisposition.match(/filename=([^;]+)/i);

          if (match) filename = decodeURIComponent(match[1]);
        }

        if (filename) {
          // Take the last part of the filename. This handles full Windows
          // paths given by IE (and possibly other dumb clients).
          return filename.substr(filename.lastIndexOf("\\") + 1);
        }
      }

      return null;
    }),

    /**
     * A low-level hook responsible for handling Message objects embedded as multipart
     * objects inside this message. It should return the value to use for the given
     * message in the parameters hash. By default parts that originate from file uploads
     * are buffered and all others are converted to strings.
     *
     * This should be overridden if you want to specify some kind of custom handling
     * for multipart data, such as streaming it directly to a network file storage.
     * For example, the server extension overrides this method to save uploaded files
     * to a temporary location on disk.
     */
    handlePart: d(function (part) {
      return part.filename ? part.bufferContent() : part.stringifyContent();
    })

  });
};