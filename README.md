[![npm package](https://img.shields.io/npm/v/mach.svg?style=flat-square)](https://www.npmjs.org/package/mach)
[![build status](https://img.shields.io/travis/mjackson/mach.svg?style=flat-square)](https://travis-ci.org/mjackson/mach)
[![dependency status](https://img.shields.io/david/mjackson/mach.svg?style=flat-square)](https://david-dm.org/mjackson/mach)
[![code climate](https://img.shields.io/codeclimate/github/mjackson/mach.svg?style=flat-square)](https://codeclimate.com/github/mjackson/mach)

[Mach](https://github.com/mjackson/mach) is an HTTP server and client library that runs in both node.js and the browser. It has the following goals:

  * Simplicity: straightforward mapping of HTTP requests to JavaScript function calls
  * Asynchronous: responses can be deferred using Promises/A+ promises
  * Streaming: request and response bodies can be streamed
  * Composability: middleware composes easily using promises
  * Robustness: promises propagate errors up the call stack, simplifying error handling

### Servers

Writing a "Hello world" HTTP server in Mach is simple.

```js
var mach = require('mach');

mach.serve(function (conn) {
  return "Hello world!";
});
```

All mach applications receive a single argument: a [Connection](https://github.com/mjackson/mach/blob/master/modules/Connection.js) object. This object contains information about both the request and the response, as well as metadata including the `method` used in the request, the [location](https://github.com/mjackson/mach/blob/master/modules/Location.js) of the request, the `status` of the response, and some helper methods.

Applications can send responses asynchronously using JavaScript promises. Simply return a promise from your app that resolves when the response is ready.

```js
var app = mach.stack();

app.use(mach.logger);

app.get('/users/:id', function (conn) {
  var id = conn.params.id;

  return getUser(id).then(function (user) {
    conn.json(200, user);
  });
});
```

The call to `app.use` above illustrates how middleware is used to compose applications. Mach ships with the following middleware:

- [`mach.basicAuth`](https://github.com/mjackson/mach/blob/master/modules/middleware/basicAuth.js): Provides authentication using [HTTP Basic auth](http://en.wikipedia.org/wiki/Basic_access_authentication)
- [`mach.catch`](https://github.com/mjackson/mach/blob/master/modules/middleware/catch.js): Error handling at any position in the stack
- [`mach.charset`](https://github.com/mjackson/mach/blob/master/modules/middleware/charset.js): Provides a default [charset](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.17) in responses
- [`mach.contentType`](https://github.com/mjackson/mach/blob/master/modules/middleware/contentType.js): Provides a default [`Content-Type`](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.17)
- [`mach.favicon`](https://github.com/mjackson/mach/blob/master/modules/middleware/favicon.js): Handles requests for `/favicon.ico`
- [`mach.file`](https://github.com/mjackson/mach/blob/master/modules/middleware/file.js): Efficiently serves static files
- [`mach.gzip`](https://github.com/mjackson/mach/blob/master/modules/middleware/gzip.js): [Gzip](http://en.wikipedia.org/wiki/Gzip)-encodes response content for clients that `Accept: gzip`
- [`mach.logger`](https://github.com/mjackson/mach/blob/master/modules/middleware/logger.js): Logs HTTP requests to the console
- [`mach.mapper`](https://github.com/mjackson/mach/blob/master/modules/middleware/mapper.js): Provides virtual host mapping, similar to [Apache's Virtual Hosts](http://httpd.apache.org/docs/2.2/vhosts/) or [nginx server blocks](http://nginx.org/en/docs/http/ngx_http_core_module.html#server)
- [`mach.methodOverride`](https://github.com/mjackson/mach/blob/master/modules/middleware/methodOverride.js): Overrides the HTTP method used in the request, for clients (like HTML forms) that don't support methods other than `GET` and `POST`
- [`mach.modified`](https://github.com/mjackson/mach/blob/master/modules/middleware/modified.js): HTTP caching using [`Last-Modified`](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.29) and [`ETag`](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.19)
- [`mach.params`](https://github.com/mjackson/mach/blob/master/modules/middleware/params.js): Multipart request parsing and handling
- [`mach.proxy`](https://github.com/mjackson/mach/blob/master/modules/middleware/proxy.js): Proxy request through to an alternate location
- [`mach.rewrite`](https://github.com/mjackson/mach/blob/master/modules/middleware/rewrite.js): Rewrites request URLs on the fly, similar to [Apache's mod_rewrite](http://httpd.apache.org/docs/current/mod/mod_rewrite.html)
- [`mach.router`](https://github.com/mjackson/mach/blob/master/modules/middleware/router.js): Request routing (ala [Sinatra](http://www.sinatrarb.com/)) based on the URL pathname
- [`mach.session`](https://github.com/mjackson/mach/blob/master/modules/middleware/session.js): HTTP sessions with pluggable storage including [memory](https://github.com/mjackson/mach/blob/master/modules/middleware/session/MemoryStore.js) (for development and testing), [cookies](https://github.com/mjackson/mach/blob/master/modules/middleware/session/CookieStore.js), and [Redis](https://github.com/mjackson/mach/blob/master/modules/middleware/session/RedisStore.js)
- [`mach.stack`](https://github.com/mjackson/mach/blob/master/modules/middleware/stack.js): Provides a `use` mechanism for composing applications fronted by middleware
- [`mach.token`](https://github.com/mjackson/mach/blob/master/modules/middleware/token.js): Cross-site request forgery protection

Please check out the source of a middleware file for detailed documentation on how to use it.

### Clients

Writing an HTTP client is similarly straightforward.

```js
var mach = require('mach');

mach.get('http://twitter.com').then(function (conn) {
  console.log(conn.status, conn.response.headers, conn.responseText);
});
```

By default client responses are buffered and stored in the `responseText` connection variable for convenience. However, if you'd like to access the raw stream of binary data in the response, you can use the `binary` flag.

```js
var fs = require('fs');

mach.get({
  url: 'http://twitter.com',
  binary: true
}).then(function (conn) {
  conn.responseText; // undefined
  conn.response.content.pipe(fs.createWriteStream('twitter.html'));
});
```

### Proxies

Because all Mach applications share the same signature, it's easy to combine them in interesting ways. Mach's HTTP proxy implementation illustrates this beautifully: a proxy is simply an application that forwards the request somewhere else.

```js
var proxyApp = mach.createProxy('http://twitter.com');

// In a server environment we can use the mach.proxy middleware
// to proxy all requests to the proxy's location.
app.use(mach.proxy, proxyApp);

// In a client application we can call the proxy directly to
// send a request to the proxy's location.
mach.post(proxyApp, {
  params: {
    username: 'mjackson'
  }
});
```

### Installation

Using [npm](https://www.npmjs.org/):

    $ npm install mach

Or, include [`lib/umd/mach.min.js`](https://github.com/mjackson/mach/blob/master/lib/umd/mach.min.js) in a `<script>` tag:

```html
<script src="mach.min.js"></script>
```

### Issues

Please file issues on the [issue tracker on GitHub](https://github.com/mjackson/mach/issues).

### Tests

To run the tests in node:

    $ npm install
    $ npm test

The Redis session store tests rely on Redis to run successfully. By default they are skipped, but if you want to run them fire up a Redis server on the default host and port and set the `$WITH_REDIS` environment variable.

    $ WITH_REDIS=1 npm test

To run the tests in Chrome:

    $ npm install
    $ npm run test-browser

### Influences

  * [Strata](http://stratajs.org/)
  * [Q-HTTP](https://github.com/kriskowal/q-http)
  * [JSGI & Jack](http://jackjs.org/)
  * [node.js](http://nodejs.org/)

### License

[MIT](http://opensource.org/licenses/MIT)
