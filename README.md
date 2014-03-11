## Mach

Mach is a better way to build fully asynchronous web servers using node.js. It has the following goals:

  * Simplicity: straightforward mapping of HTTP requests to JavaScript function calls
  * Asynchronous: responses can be deferred using a standard Promises/A+ compatible promise
  * Streaming: request and response bodies can be streamed
  * Composability: middleware composes easily using promises
  * Robust: Promises propagate errors up the call stack, simplifying error handling

"Hello world" in Mach is simple.

```js
require("mach").serve(function (request) {
  return "Hello world!";
});
```

More complex applications can be built through the use of various middleware. Mach includes middleware for doing many common tasks including Sinatra-style request routing, HTTP caching, content negotiation, multipart handling, and much more. Asynchronous responses are fully supported through the use of [promises](http://promises-aplus.github.io/promises-spec/).

A more full-featured example might look like this:

```js
var mach = require('mach');
var app = mach.stack();

// Log all requests.
app.use(mach.logger);

// Serve requests to the "files" subdomain with a static file server.
app.map('files.example.com', function (app) {
  app.use(mach.file, '/www/downloads');
});

app.use(mach.session);    // HTTP sessions
app.use(mach.params);     // Parse request parameters

app.get('/', function (request) {
  return "Hello world!";
});

// GET /posts/123.json
app.get('/posts/:post_id.json', function (request, postId) {
  return query('SELECT * FROM posts WHERE id=?', postId).then(JSON.stringify);
});

// POST /posts/123/comments
app.post('/posts/:post_id/comments', function (request) {
  var authorId = request.params.author_id;
  var commentBody = request.params.body;
  // ...
  return 201;
});

// Serve the app, listening on port 3000.
mach.serve(app, 3000);
```

Please [checkout the docs](https://github.com/machjs/mach/wiki) for more information and lots of usage examples.

### Installation

    $ npm install mach

### Issues

Please file issues on the [issue tracker on GitHub](https://github.com/machjs/mach/issues).

### Specs

Before you run the specs, do an `npm install`.

To run all the specs:

    $ mocha spec

To run an individual spec:

    $ mocha spec/content-type-spec.js

The Redis session store specs rely on Redis to run successfully. By default they are skipped, but if you want to run them fire up a Redis server on the default host and port and set the `$WITH_REDIS` environment variable.

    $ WITH_REDIS=1 mocha spec

### Influences

* [Strata](http://stratajs.org/)
* [Q-HTTP](https://github.com/kriskowal/q-http)
* [JSGI & Jack](http://jackjs.org/)
* [node.js](http://nodejs.org/)
