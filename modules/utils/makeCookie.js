/**
 * Creates a cookie string using the given options, which may be any of
 * the following:
 *
 *   - value
 *   - domain
 *   - path
 *   - expires
 *   - secure
 *   - httpOnly
 */
function makeCookie(name, options) {
  options = options || {};

  if (typeof options === 'string')
    options = { value: options };

  var cookie = encodeURIComponent(name) + '=' + encodeURIComponent(options.value || '');

  if (options.domain)   cookie += '; domain=' + options.domain;
  if (options.path)     cookie += '; path=' + options.path;
  if (options.expires)  cookie += '; expires=' + options.expires.toUTCString();
  if (options.secure)   cookie += '; secure';
  if (options.httpOnly) cookie += '; HttpOnly';

  return cookie;
}

module.exports = makeCookie;
