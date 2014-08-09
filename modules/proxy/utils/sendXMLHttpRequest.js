var XMLHttpRequest = window.XMLHttpRequest;
var Promise = require('bluebird').Promise;
var Stream = require('bufferedstream');
var Response = require('../../Response');
var bufferStream = require('./bufferStream');

var LINE_SEPARATOR = /\r?\n/;
var HEADER_SEPARATOR = ': ';

function copyStatusAndHeaders(xhr, response) {
  var headers = xhr.getAllResponseHeaders();

  headers.split(LINE_SEPARATOR).forEach(function (line) {
    var index = line.indexOf(HEADER_SEPARATOR);

    if (index === -1) {
      response.addHeader(line, true);
    } else {
      response.addHeader(line.substring(0, index), line.substring(index + HEADER_SEPARATOR.length));
    }
  });

  response.status = xhr.status;

  return response.status;
}

function getContent(xhr) {
  var type = String(xhr.responseType).toLowerCase();

  if (type === 'blob')
    return xhr.responseBlob || xhr.response;

  if (type === 'arraybuffer')
    return xhr.response;

  return xhr.responseText;
}

function pipeContent(xhr, response, offset) {
  var content = getContent(xhr);

  if (content.toString().match(/ArrayBuffer/)) {
    response.content.write(new Uint8Array(content, offset));
    return content.byteLength;
  }

  if (content.length > offset) {
    response.content.write(content.slice(offset));
    return content.length;
  }

  return offset;
}

var READ_HEADERS_RECEIVED_STATE = true;
var READ_LOADING_STATE = true;

function sendXMLHttpRequest(options) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest;

    var url = options.protocol + '//' + options.hostname;

    if (options.protocol === 'http:' && options.port != 80 || options.protocol === 'https:' && options.port != 443)
      url += ':' + options.port;

    url += options.path;

    xhr.open(options.method, url, true);

    if ('withCredentials' in xhr)
      xhr.withCredentials = ('withCredentials' in options) ? options.withCredentials : true;

    if ('responseType' in xhr)
      xhr.responseType = options.responseType || 'arraybuffer';

    var headers = options.headers;

    if (headers) {
      for (var headerName in headers) {
        if (headers.hasOwnProperty(headerName))
          xhr.setRequestHeader(headerName, headers[headerName]);
      }
    }

    var response = new Response({ content: new Stream });
    var offset = 0, status;

    function tryToResolve() {
      if (!status && (status = copyStatusAndHeaders(xhr, response)) > 0)
        resolve(response);
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
          offset = pipeContent(xhr, response, offset);
        } catch (error) {
          READ_LOADING_STATE = false;
        }
      } else if (xhr.readyState === 4) {
        tryToResolve();
        pipeContent(xhr, response, offset);
        response.content.end();
      }
    };

    xhr.onerror = function () {
      reject(new Error('XMLHttpRequest error: ' + getContent(xhr)));
    };

    if (options.content) {
      bufferStream(options.content).then(function (content) {
        xhr.send(content.toString());
      }, reject);
    } else {
      xhr.send();
    }
  });
}

module.exports = sendXMLHttpRequest;
