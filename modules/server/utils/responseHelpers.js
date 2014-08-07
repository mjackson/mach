var Response = require('../Response');

/**
 * A helper for constructing a mach response object with the given
 * content, status, and headers.
 *
 *   function (request) {
 *     return mach.send('That is not allowed', 403, { 'Content-Type': 'text/plain' });
 *   }
 */
exports.send = function (content, status, headers) {
  return new Response({ status: status, headers: headers, content: content });
};

/**
 * A helper for constructing a text response.
 *
 *   function (request) {
 *     return mach.text('That is not allowed', 403);
 *   }
 */
exports.text = function (text, status, headers) {
  headers = headers || {};
  headers['Content-Type'] = 'text/plain';
  return exports.send(text, status, headers);
};

/**
 * A helper for constructing an HTML (text/html) response.
 *
 *   function (request) {
 *     return mach.html('<p>Thank You</p>', 202);
 *   }
 */
exports.html = function (html, status, headers) {
  headers = headers || {};
  headers['Content-Type'] = 'text/html';
  return exports.send(html, status, headers);
};

/**
 * A helper for constructing a JSON (application/json) response. You
 * can pass a JSON string directly:
 *
 *   function (request) {
 *     return mach.json('{"some":"json"}', 200);
 *   }
 *
 * or use an object that will be JSON.stringify'd:
 *
 *   function (request) {
 *     return mach.json(myObject);
 *   }
 */
exports.json = function (json, status, headers) {
  headers = headers || {};
  headers['Content-Type'] = 'application/json';
  return exports.send(typeof json === 'string' ? json : JSON.stringify(json), status, headers);
};

/**
 * A helper for constructing a redirect response. Defaults to using a 302
 * status if one isn't explicitly given.
 *
 *   function (request) {
 *     return mach.redirect('/another-url');
 *   }
 */
exports.redirect = function (location, status, headers) {
  headers = headers || {};
  headers['Location'] = location;
  status = status || 302;
  var html = '<p>You are being redirected to <a href="' + location + '">' + location + '</a></p>';
  return exports.html(html, status, headers);
};

/**
 * A helper for constructing a response that redirects the client to the
 * URL they came from (the one listed in the Referer header) or an optional
 * default location.
 *
 *   function (request) {
 *     return mach.back(request, '/default-location');
 *   }
 */
exports.back = function (request, defaultLocation) {
  return exports.redirect(request.headers.referer || defaultLocation || '/');
};
