[![build status](https://secure.travis-ci.org/mjackson/mach.png)](http://travis-ci.org/mjackson/mach)

[Mach](https://github.com/mjackson/mach) is an HTTP server and client library that runs in both node.js and the browser. It has the following goals:

  * Simplicity: straightforward mapping of HTTP requests to JavaScript function calls
  * Asynchronous: responses can be deferred using Promises/A+ promises
  * Streaming: request and response bodies can be streamed
  * Composability: middleware composes easily using promises
  * Robustness: promises propagate errors up the call stack, simplifying error handling

Writing a "Hello world" server in Mach is simple.

```js
var mach = require('mach');

mach.serve(function (conn) {
  return "Hello world!";
});
```

Writing an HTTP client is similarly straightforward.

```js
var mach = require('mach');

mach.get('http://twitter.com').then(function (conn) {
  console.log(conn.status, conn.responseText);
});
```

Please [read the documentation](https://github.com/mjackson/mach/wiki) for more information and many more usage examples.

### Installation

Using [npm](https://www.npmjs.org/):

    $ npm install mach

### Issues

Please file issues on the [issue tracker on GitHub](https://github.com/machjs/mach/issues).

### Tests

To run the tests in node:

    $ npm install
    $ npm test

The Redis session store tests rely on Redis to run successfully. By default they are skipped, but if you want to run them fire up a Redis server on the default host and port and set the `$WITH_REDIS` environment variable.

    $ WITH_REDIS=1 npm test

To run the tests in a browser, first run:

    $ npm install
    $ npm run bundle-tests
    $ npm run serve-tests

Then open [http://localhost:8080/](http://localhost:8080/) in a browser.

### Influences

  * [Strata](http://stratajs.org/)
  * [Q-HTTP](https://github.com/kriskowal/q-http)
  * [JSGI & Jack](http://jackjs.org/)
  * [node.js](http://nodejs.org/)

### License

[MIT](http://opensource.org/licenses/MIT)
