### HEAD

Breaking changes:

  * All HTTP header names are normalized by default according to RFC 2616
  * mach.Request expects an error message handler function, not a stream
  * mach.Request no longer emits "close" events. Use onClose instead
  * mach.logger expects a log message handler function, not a stream

Improvements:

  * Add mach.Message base class for mach.Request
  * Add mach.Response that also subclasses mach.Message
  * Make multipart.Part subclass mach.Message
  * Always use BufferedStream for message content
  * Add bufferContent/stringifyContent to Request
  * Request#call always returns a Response

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
