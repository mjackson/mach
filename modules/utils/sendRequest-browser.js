/* jshint -W058 */
var XMLHttpRequest = window.XMLHttpRequest;
var Stream = require('bufferedstream');
var AbortablePromise = require('./AbortablePromise');

function copyStatusAndHeaders(xhr, conn) {
  conn.response.headers = xhr.getAllResponseHeaders();
  conn.status = xhr.status;
  return conn.status;
}

function getContent(xhr) {
  var type = String(xhr.responseType).toLowerCase();

  if (type === 'blob')
    return xhr.responseBlob || xhr.response;

  if (type === 'arraybuffer')
    return xhr.response;

  if (typeof VBArray === 'function')
    return new VBArray(client.responseBody).toArray(); // IE9

  return xhr.responseText;
}

function pipeContent(xhr, stream, offset) {
  var content = getContent(xhr);

  if (content != null) {
    if (content.toString().match(/ArrayBuffer/)) {
      stream.write(new Uint8Array(content, offset));
      return content.byteLength;
    }

    if (content.length > offset) {
      stream.write(content.slice(offset));
      return content.length;
    }
  }

  return offset;
}

function enableBinaryContent(xhr) {
  if ('responseType' in xhr) {
    xhr.responseType = 'arraybuffer'; // XHR2
  } else if ('overrideMimeType' in xhr) {
    xhr.overrideMimeType('text/plain; charset=x-user-defined'); // XHR
  } else {
    xhr.setRequestHeader('Accept-Charset', 'x-user-defined'); // IE9
  }
}

function enableCredentials(xhr) {
  if ('withCredentials' in xhr)
    xhr.withCredentials = true;
}

var READ_HEADERS_RECEIVED_STATE = true;
var READ_LOADING_STATE = true;

function sendRequest(conn, location) {
  return new AbortablePromise(function (resolve, reject, onAbort) {
    var xhr = new XMLHttpRequest;
    xhr.open(conn.method, location.href, true);

    enableBinaryContent(xhr);

    if (conn.withCredentials)
      enableCredentials(xhr);

    var request = conn.request;
    var headers = request.headers;

    if (headers)
      for (var headerName in headers)
        if (headers.hasOwnProperty(headerName))
          xhr.setRequestHeader(headerName, headers[headerName]);

    var content = conn.response.content = new Stream;
    var offset = 0, status;

    function tryToResolve() {
      if (!status && (status = copyStatusAndHeaders(xhr, conn)) > 0)
        resolve(conn);
    }

    xhr.onreadystatechange = function () {
      if (xhr.error)
        return; // readystatechange triggers before error.

      if (xhr.readyState === 2 && READ_HEADERS_RECEIVED_STATE) {
        try {
          tryToResolve();
        } catch (error) {
          READ_HEADERS_RECEIVED_STATE = false;
        }
      } else if (xhr.readyState === 3 && READ_LOADING_STATE) {
        try {
          tryToResolve();
          offset = pipeContent(xhr, content, offset);
        } catch (error) {
          READ_LOADING_STATE = false;
        }
      } else if (xhr.readyState === 4) {
        tryToResolve();
        pipeContent(xhr, content, offset);
        content.end();
      }
    };

    xhr.onerror = function (event) {
      // Sometimes XHR fails due to CORS constraints. In those cases
      // we don't have any extra information here, unfortunately.
      // See http://stackoverflow.com/questions/4844643/is-it-possible-to-trap-cors-errors
      reject(event.error || new Error('XMLHttpRequest failed'));
    };

    onAbort(function () {
      try {
        xhr.abort();
      } catch (error) {
        // Not a problem.
      }

      resolve();
    });

    request.bufferContent().then(function (chunk) {
      xhr.send(chunk);
    }).then(undefined, reject);
  });
}

module.exports = sendRequest;
