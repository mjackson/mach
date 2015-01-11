/* jshint -W058 */
var createConnection = require('./createConnection');

/**
 * HTTP status codes that don't have entities.
 */
var STATUS_WITHOUT_CONTENT = {
  100: true,
  101: true,
  204: true,
  304: true
};

/**
 * Binds the given app to the "request" event of the given node HTTP server
 * so that it is called whenever the server receives a new request.
 *
 * Returns the request handler function.
 */
function createRequestHandler(app) {
  return function (nodeRequest, nodeResponse) {
    var conn = createConnection(nodeRequest);

    conn.call(app).then(function () {
      var isHead = conn.method === 'HEAD';
      var isEmpty = isHead || STATUS_WITHOUT_CONTENT[conn.status] === true;
      var headers = conn.response.headers;
      var content = conn.response.content;

      if (isEmpty && !isHead)
        headers['Content-Length'] = 0;

      if (!headers['Date'])
        headers['Date'] = (new Date).toUTCString();

      nodeResponse.writeHead(conn.status, headers);

      if (isEmpty) {
        nodeResponse.end();

        if (typeof content.destroy === 'function')
          content.destroy();
      } else {
        content.pipe(nodeResponse);
      }
    }, function (error) {
      conn.onError(error);
      nodeResponse.writeHead(500, { 'Content-Type': 'text/plain' });
      nodeResponse.end('Internal Server Error');
    });
  };
}

module.exports = createRequestHandler;
