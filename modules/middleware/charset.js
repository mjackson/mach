/**
 * A middleware that sets a default character set in the Content-Type
 * header of the response if none is already specified.
 */
function charset(app, defaultCharset) {
  defaultCharset = defaultCharset || 'utf-8';

  return function (conn) {
    return conn.call(app).then(function () {
      var response = conn.response;

      if (response.contentType && response.charset == null)
        response.charset = defaultCharset;
    });
  };
}

module.exports = charset;
