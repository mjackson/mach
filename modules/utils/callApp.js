var Connection = require('../Connection');
var Promise = require('./Promise');

/**
 * Creates a new Connection using the given options and sends
 * the request to the given app. Returns a promise for the connection
 * object when the response is received.
 *
 * Options may be any of the Connection options, plus the following:
 *
 * - binary     By default the response content is buffered and stored
 *              in the responseText property of the connection. Set this
 *              option true to disable this behavior.
 * - maxLength  The maximum length of the response content to accept.
 *              This option has no effect when "binary" is true. By
 *              default there is no maximum length.
 * - encoding   The encoding to use to decode the response body. This
 *              option has no effect when "binary" is true. By default
 *              the encoding is whatever was specified in the Content-Type
 *              header of the response.
 *
 * If a modifier function is provided, it will have a chance to modify
 * the Connection object immediately before the request is made.
 */
function callApp(app, options, modifier) {
  options = options || {};

  var c = new Connection(options);

  return Promise.resolve(modifier ? modifier(c) : c).then(function (conn) {
    if (conn == null || !(conn instanceof Connection))
      conn = c;

    return conn.call(app).then(function () {
      if (options.binary)
        return conn;

      return conn.response.stringifyContent(options.maxLength, options.encoding).then(function (content) {
        conn.responseText = content;
        return conn;
      });
    });
  });
}

module.exports = callApp;
