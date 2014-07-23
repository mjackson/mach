[![build status](https://secure.travis-ci.org/mjackson/mach.png)](http://travis-ci.org/mjackson/mach)

[Mach](https://github.com/mjackson/mach) is a better way to build fully asynchronous web servers using node.js. It has the following goals:

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

The following example should give you a good idea of what it feels like to build a real-world app with mach:

```js
var mach = require('mach');
var app = mach.stack();

app.use(mach.gzip);
app.use(mach.logger);
app.use(mach.contentType, 'text/html');
app.use(mach.file, 'public');

app.map('files.example.com', function (app) {
  app.use(mach.file, '/www/static-files');
});

app.use(mach.session, 'session secret');
app.use(mach.params);

app.get('/', function (request) {
  return "Hello world!";
});

app.get('/posts/:postID.json', function (request) {
  var postID = request.params.postID;
  return query('SELECT * FROM posts WHERE id=?', postID).then(function (post) {
    return post ? mach.json(post) : 404;
  });
});

app.post('/posts/:postID/comments', function (request) {
  var postID = request.params.postID;
  return createComment(postID, request.params).then(function (comment) {
    return mach.json(comment, 201);
  }, function (error) {
    return mach.json({ error: error.message }, 403);
  });
});

app.get('/legacy-url', function (request) {
  return mach.redirect('/new-url', 301);
});

mach.serve(app, 3000);
```

There is a lot going on in the example above, but comments have been ommitted for the sake of code clarity and conciseness. Please [read the docs](https://github.com/machjs/mach/wiki) for explanations and many more usage examples.

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
