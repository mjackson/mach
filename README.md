## Mach

__WORK IN PROGRESS__

Mach is a better way to build web servers in node.js.

* Simplicity: straightforward mapping of HTTP requests to JavaScript function calls
* Asynchronous: responses can be deferred using a standard Promises/A compatible promise
* Streaming: request and response bodies can be streamed
* Composability: middleware composes easily using promises

The "hello world" application in mach is pretty simple:

```js
function app(request) {
  return "Hello world!";
}

require('mach').serve(app);
```

Asynchronous responses are fully supported through the use of [promises](http://promises-aplus.github.io/promises-spec/).

```js
var mach = require('mach');

function app(request) {
  // start processing request
  return someAsyncOperation(request).then(function (data) {
    // finish processing request
    return {
      status: 200,
      headers: { "Content-Type": "text/plain" },
      body: data
    };
  });
}

mach.serve(app);
```

Please [checkout the docs](https://github.com/machjs/mach/wiki) for more information and lots of usage examples.

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
