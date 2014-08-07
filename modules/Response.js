var d = require('d');
var Buffer = require('buffer').Buffer;
var statusCodes = require('./utils/statusCodes');
var stringifyCookie = require('./utils/stringifyCookie');
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
    return statusCodes[this.status];
  }),

  /**
   * Sets a cookie with the given name and options.
   */
  setCookie: d(function (name, options) {
    this.addHeader('Set-Cookie', stringifyCookie(name, options));
  })

});

Object.defineProperties(Response, {

  /**
   * Creates a Response from the given object based on its type.
   */
  createFromObject: d(function (object) {
    if (typeof object === 'string' || Buffer.isBuffer(object))
      return new Response({ content: object });

    if (typeof object === 'number')
      return new Response({ status: object });

    return new Response(object);
  })

});

module.exports = Response;
