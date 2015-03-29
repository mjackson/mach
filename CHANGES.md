### HEAD

  * Fixed a bug in mach.file autoIndex with trailing slashes in the URL
    when showing a directory (#69)

### 1.3.3 / 2015-03-19

  * Fixed a bug in HTTPS detection

### 1.2.0 / 2015-01-18

  * Removed "modules" directory. This makes it easier to require pieces of mach
    e.g. require('mach/extensions/accept')
  * Removed uploadPrefix argument to Message#parseContent

### 1.1.0 / 2015-01-14

  * Added mach.submit for submitting HTML forms
  * Fixed a bug in middleware that double as standalone apps that caused them
    to throw an error when used in a stack that had no default app. This includes
    mach.file, mach.mapper, and mach.router
  * Fixed multi-byte encoding issues (see #53)
  * Moved Connection#statusText into statusText extension
  * Added acceptCharset, acceptEncoding, acceptLanguage, and middleware extensions.
    The accept extension now only adds support for the Accept header
  * Added Message#getHeader
  * Added Message.PARSERS for adding custom message parsers keyed by media type
  * Added capability for generating multipart content streams
  * Rolled multipart.Part functionality into the multipart extension. Now, instead
    of using a separate class the multipart extension just augments mach.Message
  * Rolled the fs extension into the server extension, since they are always used
    in the same environment (node.js)

### 1.0.2 / 2015-01-03

  * Fixed bundler build (webpack)

### 1.0.1 / 2015-01-02

  * Fixed a bug with using Last-Modified and ETag headers with mach.file
  * Added support for binary response bodies in IE9
  * Moved Message#setCookie into the server extension
  * Upgraded BufferedStream dependency to 3.0.7

### 1.0.0 / 2015-01-02

  * Added mach.extend for loading "extensions" to the mach object. By default all
    extensions are loaded in node.js. Only the client extension is loaded in browsers.
  * Added a global build for use in browsers.

### 1.0.0-rc4 / 2014-12-23

  * Fixed client argument coercion, see #62
  * Added setters for Message#mediaType and Message#charset
  * Location#concat uses the protocol, auth, and host of its argument, if present
  * Location#protocol and Location#hostname default to null
  * Added mach.createConnection
  * Added Connection#back

### 1.0.0-rc3

  * Proxies now correctly append the path used in the request
  * Fix using a custom port with a node client
  * Safer URL parsing in DOM environments

### 1.0.0-rc2

  * Add mach.charset middleware for automatically setting the response charset
  * Add autoIndex option to mach.file to automatically generate a directory listing
    when a directory is targeted in the request
  * Add setters to Location properties
  * Add setters to Connection location properties
  * Renamed mach.forward => mach.proxy
  * Use mime.types from nginx instead of mime module
  * Fixed a bug in conn.json response helper

### 1.0.0-rc1

Breaking changes:

  * All HTTP header names are normalized by default according to RFC 2616
  * mach.Connection replaces mach.Request and mach.Response
  * mach.logger expects a log message handler function, not a stream
  * Removed high-level status-based response helpers (i.e. mach.ok, mach.badRequest, etc.)
  * Probably many, many more

Improvements:

  * Better reverse-proxy detection
  * Add HTTP client module (mach.call, mach.get, mach.post, etc.)
  * Add HTTP proxy module
  * Add mach.Location (analogous to window.location for URLs)
  * Add mach.Message class for HTTP messages (i.e. request and response)
  * Make multipart.Part subclass mach.Message
  * Always use BufferedStream for message content
  * Add Message#bufferContent and Message#stringifyContent
  * Add Connection#location

### 0.12.0 / 2014-07-17

  * mach.stack respects ordering of routes as well as mappings
  * Add mach.rewrite middleware

### 0.11.0 / 2014-07-11

  * Add route parameters to request.params instead of passing them
    as extra arguments to apps. This cleans up the API by allowing
    us to remove Request#apply completely and also tightens up the
    spec by forcing all apps to have the exact same method signature
  * Removed Request#apply interface
  * App interface is app.call(request, request) instead of
    app.apply(request, args)
  * Add onPart argument to multipart.Parser
  * Removed dependency on microtime module (issue #19)
  * Replace mach.urlMap with mach.map
  * mach.file needs an app argument, same as other middleware
  * Fixed a bug that prevented mach.mapper from matching when there
    is no remaining path

### 0.10.1 / 2014-07-06

  * Corrected case for some require statements

### 0.10.0 / 2014-07-05

  * Add Date header if not already present in responses
  * Removed upper-case versions of middleware
  * Added content stream property to multipart.Part objects that are
    instances of multipart.Content
  * Renamed Request#baseUrl => Request#baseURL
  * Refactored utils module into many separate files
  * Moved all response helpers from utils into the main module

### 0.9.3 / 2014-06-25

  * Exclude undefined values from Request#filterParams

### 0.9.2 / 2014-03-19

  * Exclude specs from npm package

### 0.9.1 / 2014-03-17

  * Made package dependencies friendly with npm 1.3
  * then-redis package is optional

### 0.9.0 / 2014-03-17

  * Added accepts* content-negotiation methods to Request
  * Fixed case-sensitive require statement (thanks nicholascloud)
  * mach.token takes options as second argument
  * mach.session accepts session secret as second argument
  * Renamed utils.makeKey => utils.makeToken
  * Renamed utils.encodeCookie => utils.makeCookie

### 0.8.0 / 2014-03-14

  * Sign all session cookies

### 0.7.0 / 2014-03-12

  * Now using RSVP promises

### 0.6.3 / 2014-03-01

  * Add PATCH support to the router
  * HTTP methods are 2nd argument to router.route
  * Use index:true in mach.file to automatically serve index.html
  * Converted stack, mapper, router, file, gzip, and logger middleware to be proper
    classes instead of overloaded functions

### 0.6.2 / 2014-01-30

  * Use timer.unref() instead of clearTimeout when shutting down

### 0.6.1 / 2013-12-17

  * Added `mach.send`, `mach.text`, `mach.html`, `mach.json`, `mach.redirect`,
    and `mach.back` response helpers
  * Renamed `Request#parseParams` => `Request#getParams`

### 0.6.0 / 2013-10-29

  * Added `Request#apply` and made `Request#call` accept extra arguments
  * Removed `route` request variable in favor of extra arguments to `Request#apply`
  * Removed support for arrays as a response
  * `mach.bind` returns the request handler function

### 0.5.4 / 2013-10-28

  * Added `Request#filterParams` and `Request#parseParams` for easier ad hoc parsing
    of request parameters

### 0.5.3 / 2013-09-25

  * Removed `mach.gracePeriod` in favor of `timeout` option to `mach.serve`
  * Renamed `utils.hash` to `utils.makeHash`
