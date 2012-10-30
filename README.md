# Mach: HTTP for JavaScript

__WORK IN PROGRESS__

Mach is a better way to build web servers in Node.js and other JavaScript platforms.

* Simplicity: straightforward mapping of HTTP requests to JavaScript function calls
* Asynchronous: responses can be deferred using a standard Promises/A compatible promise
* Streaming: request and response bodies can be streamed
* Composability: middleware composes easily  using promises

## Apps

Here's what an asynchronous request might look like:

  function (request) {
      // start processing request
      return Q.when(someAsyncOperation(request), function(data) {
          // finish processing request
          return {
              status: 200,
              headers: { "Content-Type": "text/plain" },
              body: /* TBD  */
          };
      });
  }

The `request` and `response` objects are defined [in the spec](https://github.com/machjs/mach/blob/master/SPEC.md)

## Middleware

The real power in Mach is with middleware. Middleware can intercept and modify requests and responses to implement all sorts of things like caching and logging, and introduce new control flow mechanisms like throttling, retrying requests, proxying, etc.

The convention for middleware is a JavaScript function, which typically takes a Mach "app" function as the first argument and returns another Mach "app" as the response.

For example, this middleware logs request URLs:

    function Logger(app) {
        return function(request) {
            console.log(request.url);
            return app(request);
        }
    }
    
If we wanted to modify this to log the response status code we could do that easily:

    function Logger(app) {
        return function(request) {
            return Q.when(app(request), function(response) {
                console.log(response.status, request.url);
                return response;
            });
        }
    }

Then you'd simple wrap your app in this logger middleware:

    var myApp = function(request) {
       ...
    }
    var server = Server(Logger(myApp));

## Server

Mach server accepts a Mach app and returns a server instance:

    Server(myApp).listen(3000);

## Client

The same Mach interface can be used for HTTP clients as well as servers. This lets you do things like share middleware between them.

Say you wanted to log all HTTP requests your app makes, all you need to do is wrap the client in the same Logger middleware we defined above:

    loggingClient = Logger(Client);
    Q.when(loggingClient({ url: "http://example.com/" })

One interesting property of using the same interface for the client and server is a simple HTTP proxy is trivial to create:

    Server(Client).listen(8080);

(This works because the client connects to the server in the `Host` header, or the `url` property if the `Host` header doesn't exist)

Or, a logging proxy:

    Server(Logger(Client)).listen(8080);

The ability to compose HTTP applications and middleware like this is extremely powerful.

## Pending Design Decisions

* [Should response always be a promise?](https://github.com/machjs/mach/issues/1)
* [Request and response "body" object](https://github.com/machjs/mach/issues/2)
* [Request headers](https://github.com/machjs/mach/issues/3)

## Influences

* [StrataJS](http://stratajs.org/)
* [Q-HTTP](https://github.com/kriskowal/q-http)
* [JSGI & Jack](http://jackjs.org/)
* [Node.js](http://nodejs.org/)