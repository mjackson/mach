/**
 * A middleware that sets a default `charset` in the `Content-Type` header, if
 * one hasn't already been set in a downstream app.
 */

function injectCharSetIntoHeaders(argumentDict) {
  var charSet = argumentDict['charSet'] || 'utf-8';
  var headers = argumentDict['headers'];

  if (!headers)
    throw new Error("injectCharSetIntoHeaders requires `headers`.");

  if (!headers['Content-Type'])
    throw new Error("contentCharSet must be called after contentType.");

  if (headers['Content-Type'].indexOf("charset") === -1) {
    headers['Content-Type'] += "; charset=" + charSet;

  } else {
    console.warn(charSet + " not injected because " + headers['Content-Type'] + " already has a charSet.");
  }
}

function contentCharSet(app, charSet) {
  return function (conn) {
    return conn.call(app).then(function () {
      injectCharSetIntoHeaders(
        {
          charSet: charSet,
          headers: conn.response.headers
        }
      );
    });
  };
}

module.exports = {
  asMiddleware: contentCharSet,
  asInjector: injectCharSetIntoHeaders
};
