var Promise = require('bluebird');
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

var CAN_READ_STATE2 = true;
var CAN_STREAM_CONTENT = true;

function sendXMLHttpRequest(options) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest;

    var url = options.protocol + '//' + options.hostname + options.path;
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

    var response = new Response;
    var offset = 0, status;

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 2 && CAN_READ_STATE2) {
        try {
          status = copyStatusAndHeaders(xhr, response);
        } catch (error) {
          CAN_READ_STATE2 = false;
        }
      } else if (xhr.readyState === 3 && CAN_STREAM_CONTENT) {
        if (!status)
          status = copyStatusAndHeaders(xhr, response);

        try {
          offset = pipeContent(xhr, response, offset);
        } catch (error) {
          CAN_STREAM_CONTENT = false;
        }
      } else if (xhr.readyState === 4) {
        if (!status)
          status = copyStatusAndHeaders(xhr, response);

        offset = pipeContent(xhr, response, offset);

        if (xhr.error) {
          reject(new Error('XMLHttpRequest error: ' + getContent(xhr)));
        } else {
          resolve(response);
        }
      }
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
