var d = require('d');
var StatusCodes = require('./utils/StatusCodes');
var Message = require('./Message');

/**
 * An HTTP response.
 *
 * Options may be any of the following:
 *
 *   - content      A readable stream containing the message content
 *   - headers      An object of HTTP headers and values
 *   - status       The HTTP status code
 */
function Response(options) {
  options = options || {};

  Message.call(this, options.content, options.headers);

  this.status = options.status || 200;
}

Response.prototype = Object.create(Message.prototype, {

  constructor: d(Response),

  /**
   * The message that corresponds with the status code.
   */
  statusText: d.gs(function () {
    return StatusCodes[this.status];
  })

});

module.exports = Response;
