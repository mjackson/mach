var d = require('describe-property');
var objectAssign = require('object-assign');
var parseMessage = require('../multipart/parseMessage');

var BOUNDARY_MATCHER = /^multipart\/.*boundary=(?:"([^"]+)"|([^;]+))/im;

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
  objectAssign(mach.Message.PARSERS, {
    'multipart/form-data': parseMultipartMessage
  });

  Object.defineProperties(mach.Message.prototype, {

    /**
     * The value that was used as the boundary for multipart content.
     */
    multipartBoundary: d.gs(function () {
      var contentType = this.contentType, match;
      return (contentType && (match = contentType.match(BOUNDARY_MATCHER))) ? (match[1] || match[2]) : null;
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
