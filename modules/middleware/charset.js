var CHARSET_MATCHER = /\bcharset=([\w-]+)/;

/**
 * A middleware that sets a default character set in the Content-Type
 * header of the response if none is already specified.
 */
function charset(app, defaultCharset) {
  defaultCharset = defaultCharset || 'utf-8';

  return function (conn) {
    return conn.call(app).then(function () {
      var response = conn.response;
      var contentType = response.contentType;

      if (contentType && !CHARSET_MATCHER.test(contentType))
        response.contentType = contentType + '; charset=' + defaultCharset;
    });
  };
}

module.exports = charset;
