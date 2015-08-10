# API Reference

This documentation is for mach 1.x

- ## [Mach](#Mach2)
    * [`.get(<String|Object>)`](#getStringObject)
    * [`.get(<Stack>, <String|Object>)`](#getStackStringObject)
    * [`.put(<String|Object>)`](#putStringObject)
    * [`.put(<Stack>, <String|Object>)`](#putStackStringObject)
    * [`.post(<String|Object>)`](#postStringObject)
    * [`.post(<Stack>, <String|Object>)`](#postStackStringObject)
    * [`.delete(<String|Object>)`](#deleteStringObject)
    * [`.delete(<Stack>, <String|Object>)`](#deleteStackStringObject)
    * [`.stack() -> Stack`](#Stack2)
- ## [Stack](#Stack2)
    * [`.use(<Function(Function, [Object]) -> Function(Mach.Connection)>)`]()
    * [`.map(<String>, <Function(Function) -> Function(Mach.Connection)>)`]()
    * [`.get(<Function(String, Function)>)`]()
    * [`.post(<Function(String, Function)>)`]()
    * [`.put(<Function(String, Function)>)`]()
    * [`.delete(<Function(String, Function)>)`]()
- ## [Connection](#Connection2)
    * [`.call(<Function(<Connection>))`](#callFunctionConnection)

## Mach

Mach is a promise based web handling framework for the server and browser environments. It uses the concept of middleware to handle requests on both the client and server side.

Building up a middleware stack allows you to create complex web handlers for both server and client environments.

Mach aims for simplicity and provides simple building blocks that allow you to create complex environments and handlers.

The consistent API throughout mach is the `Connection` object. This object is passed through all middleware and handlers, on both the request and response side.

#### `.get(<String|Object>)`

Client method to send a GET request to a URL. The url can be specified with a string or Object.

    mach.get("https://my.app.com/at/some/path?with=params")
    .then(function(conn) {
      conn.response.responseText;
    });

    mach.get(urlCompatibleObject).then(function(conn) {
      # handle response on the conn object
    });

#### `.get(<Stack>, <String|Object>)`

Same as the `.get(<String|Object>)` handler, but allows you to specify a custom stack to push the request through.

    mach.get(authdStack, "https://my.app.com/api/me").then(function(conn) {
      # handle the response on the conn object
    });

#### `.put(<String|Object>)`

See [`.get(<String|Object>)`](#getStringObject)

#### `.put(<Stack>, <String|Object>)`

See [`.get(<Stack>, <String|Object>)`](#getStackStringObject)

#### `.post(<String|Object>)`

See [`.get(<String|Object>)`](#getStringObject)

#### `.post(<Stack>, <String|Object>)`

See [`.get(<Stack>, <String|Object>)`](#getStackStringObject)

#### `.delete(<String|Object>)`

See [`.get(<String|Object>)`](#getStringObject)

#### `.delete(<Stack>, <String|Object>)`

See [`.get(<Stack>, <String|Object>)`](#getStackStringObject)

## Stack

Mach uses the concept of a stack for both Server and Clients.

A stack is a collection of middleware that each request/response passes through.

#### .use(<Function(app, [Object])>) -> <Function(Mach.Connection)>

Append a middleware function to the stack. When requests come into the stack, all requests pass through middlewares.

An example server stack:

    stack = mack.stack()
    stack.use(mach.gzip)
    stack.use(mach.file, __dirname + '/public');

An example client stack:

    authdStack = mach.stack()
    authdStack.use(function(app) {
      return function(conn) {
        conn.request.headers['Authorization'] = 'Bearer ' + token;
        return conn.call(app);
      };
    });

Middleware can be be used on both the server and client. Some middlewares only make sense one or the other context, but the general concept of using middleware to handle requests is the same in both contexts.

#### `.map(<String>, <Function(Function) -> Function(Mach.Connection)>)`

Maps a request path to a middleware branch.

    app.map('/images', mach.file('/public/img'));

This particular example will direct all requests that begin with `/images` to the `mach.file` middleware.

#### `.get(<Function(String, Function)>)`

A 'GET' handler. Matches on a path definition when the HTTP method is GET. When it matches, the function is run as the handler for the request. 

    app.get('/hello', function(conn) {
      return 'Hello';
    });

    app.get('/hello.json', function(conn) {
      return conn.json({ message: 'Hello' });
    });

    app.get('/hello.stream', function(conn) {
      return someStream;
    });

The function may return a 

* String
* Stream
* Response

#### `.post(<Function(String, Function)>)`

A 'POST' handler. Matches on a path definition when the HTTP method is POST. When it matches, the function is run as the handler for the request. 

    app.post('/hello', function(conn) {
      return 'Hello';
    });

    app.post('/hello.json', function(conn) {
      return conn.json({ message: 'Hello' });
    });

    app.post('/hello.stream', function(conn) {
      return someStream;
    });

The function may return a

* String
* Stream
* Response

#### `.put(<Function(String, Function)>)`

A 'PUT' handler. Matches on a path definition when the HTTP method is PUT. When it matches, the function is run as the handler for the request. 

    app.put('/hello', function(conn) {
      return 'Hello';
    });

    app.put('/hello.json', function(conn) {
      return conn.json({ message: 'Hello' });
    });

    app.put('/hello.stream', function(conn) {
      return someStream;
    });

The function may return a

* String
* Stream
* Response

#### `.delete(<Function(String, Function)>)`

A 'DELETE' handler. Matches on a path definition when the HTTP method is DELETE. When it matches, the function is run as the handler for the request. 

    app.delete('/hello', function(conn) {
      return 'Hello';
    });

    app.delete('/hello.json', function(conn) {
      return conn.json({ message: 'Hello' });
    });

    app.delete('/hello.stream', function(conn) {
      return someStream;
    });

The function may return a

* String
* Stream
* Response

## Connection

An HTTP connection that acts as the asynchronous primitive for the duration of the request/response cycle.

 Important features are:

* request
    * A Message representing the request being made. In
      a server environment, this is an "incoming" message
      that was probably generated by a web browser or some
      other consumer. In a client environment, this is an
      "outgoing" message that we send to a remote server.
* response
    * A Message representing the response to the request.
      In a server environment, this is an "outgoing" message
      that will be sent back to the client. In a client
      environment, this is the response that was received
      from the remote server.
* method
    * The HTTP method that the request uses
* location
    * The URL of the request. In a server environment, this
      is derived from the URL path used in the request as
      well as a combination of the Host, X-Forwarded-* and
      other relevant headers.
* version
    * The version of HTTP used in the request
* status
    * The HTTP status code of the response
* statusText
    * The HTTP status text that corresponds to the status
* responseText
     * This is a special property that contains the entire
       content of the response. It is present by default when
       making client requests for convenience, but may also be
       disabled when you need to stream the response.

 Options may be any of the following:

- content
    - The request content, defaults to ""
- headers
    - The request headers, defaults to {}
- method
    - The request HTTP method, defaults to "GET"
- location/url
    - The request Location or URL
- withCredentials
    - Used on the client side to specify CORS behaviour
- params
    - The request params
- onError
    - A function that is called when there is an error
- onClose
    - A function that is called when the request closes

The options may also be a URL string to specify the URL.

#### `.call(<Function(Connection)>)`

Delegate to the next middleware in the stack. Eventually calling down to a handler.

    stack = mack.stack()

    stack.use(function(app) {
      return function(conn) {
        return conn.call(app);
      };
    });
