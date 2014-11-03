var d = require('d');
var parseMessage = require('./parseMessage');

var _parseContent = require('../Message').prototype._parseContent;

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

module.exports = {

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
   * Override Message#_parseContent.
   */
  _parseContent: d(function (maxLength, uploadPrefix) {
    if (this.isMultipart)
      return parseMultipartMessage(this, maxLength, uploadPrefix);

    return _parseContent.apply(this, arguments);
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

};
