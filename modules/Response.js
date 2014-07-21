var d = require('d');
var bops = require('bops');
var makeCookie = require('./utils/makeCookie');
var Message = require('./Message');

var STATUS_CODES = require('./index').STATUS_CODES;

/**
 * An HTTP response.
 *
 * Options may be any of the following:
 *
 *   - headers      An object of HTTP headers and values
 *   - content      A readable stream containing the message content
 *   - status       The HTTP status code
 */
function Response(options) {
  if (!(this instanceof Response))
    return new Response(options);

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
    return STATUS_CODES[this.status];
  }),

  /**
   * Sets a cookie with the given name and options.
   */
  setCookie: d(function (name, options) {
    this.addHeader('Set-Cookie', makeCookie(name, options));
  })

});

Object.defineProperties(Response, {

  /**
   * Creates a Response from the given object based on its type.
   */
  createFromObject: d(function (object) {
    if (typeof object === 'string' || bops.is(object))
      return new Response({ content: object });

    if (typeof object === 'number')
      return new Response({ status: object });

    return new Response(object);
  })

});

module.exports = Response;
