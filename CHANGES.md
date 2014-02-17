### HEAD

  * Add PATCH support to the router
  * HTTP methods are 2nd argument to router.route

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
