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
  }),

  /**
   * Redirects the client to the given location. If status is not
   * given, it defaults to 302 Found.
   */
  redirect: d(function (status, location) {
    if (typeof status !== 'number') {
      location = status;
      status = 302;
    }

    this.status = status;
    this.headers['Location'] = location;
  }),

  /**
   * Writes some data to the content stream, along with an optional status.
   */
  send: d(function (status, data) {
    if (typeof status !== 'number') {
      this.write(status);
    } else {
      this.status = status;
    }

    if (data)
      this.write(data);
  }),

  /**
   * Writes some data to the content stream.
   */
  write: d(function (data) {
    return this.content.write(data, arguments[1]);
  })

});

module.exports = Response;
