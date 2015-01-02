var d = require('describe-property');
var parseMessage = require('../multipart/parseMessage');

function parseMultipartMessage(message, maxLength, uploadPrefix) {
  function partHandler(part) {
    return message.handlePart(part, uploadPrefix);
  }

  // If the content has been buffered, use the buffer.
  if (message.isBuffered) {
    return message.bufferContent().then(function (content) {
      return parseMessage(content, message.multipartBoundary, maxLength, partHandler);
    });
  }

  return parseMessage(message.content, message.multipartBoundary, maxLength, partHandler);
}

module.exports = function (mach) {
  var _parseContent = mach.Message.prototype._parseContent;

  Object.defineProperties(mach.Message.prototype, {

    /**
     * Override Message#_parseContent to enable parsing multipart messages.
     */
    _parseContent: d(function (maxLength, uploadPrefix) {
      if (this.isMultipart)
        return parseMultipartMessage(this, maxLength, uploadPrefix);

      return _parseContent.apply(this, arguments);
    }),

    /**
     * True if this message is multipart, false otherwise.
     */
    isMultipart: d.gs(function () {
      return this.multipartBoundary != null;
    }),

    /**
     * The value that was used as the boundary for multipart content.
     */
    multipartBoundary: d.gs(function () {
      var contentType = this.contentType;

      if (contentType) {
        var match = contentType.match(/^multipart\/.*boundary=(?:"([^"]+)"|([^;]+))/im);
        return match && (match[1] || match[2]);
      }
    }),

    /**
     * A low-level hook responsible for handling multipart.Part objects when
     * parsing multipart message content. It should return the value to use for
     * that part in the parameters hash, or a promise for the value. By default
     * it converts all parameters to strings.
     *
     * This should be overridden if you want to specify some kind of custom handling
     * for multipart data, such as streaming it directly to a network file storage.
     */
    handlePart: d(function (part, uploadPrefix) {
      return part.stringifyContent();
    })

  });
};
