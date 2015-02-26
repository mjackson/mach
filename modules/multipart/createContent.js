/* jshint -W058 */
var Stream = require('bufferedstream');
var Promise = require('../utils/Promise');
var readFile = require('../utils/readFile');
var File = require('../utils/File');

function createHeaders(name, filename, type) {
  var header = 'Content-Disposition: form-data; name="' + name + '"';

  if (filename)
    header += '; filename="' + filename + '"';

  if (type)
    header += '\r\nContent-Type: ' + type;

  return header + '\r\n\r\n';
}

/**
 * Creates and returns a binary stream of multipart content produced
 * from the given params. Param values may be a string, binary, or File
 * object, or an array of any of those types.
 */
function createContent(params, boundary) {
  var content = new Stream;

  // Use a promise chain to write all fields to the content
  // stream in the same order they appear in params.
  var promise = Promise.resolve();

  function appendContent(name, value) {
    if (value instanceof File) {
      var p = readFile(value);

      promise = promise.then(function () {
        content.write('--' + boundary + '\r\n' + createHeaders(name, value.name, value.type));

        return p.then(function (chunk) {
          content.write(chunk);
          content.write('\r\n');
        });
      });
    } else {
      promise = promise.then(function () {
        content.write('--' + boundary + '\r\n' + createHeaders(name));
        content.write(value);
        content.write('\r\n');
      });
    }
  }

  var param, i;
  for (var name in params) {
    if (params.hasOwnProperty(name)) {
      param = params[name];

      if (Array.isArray(param)) {
        for (i = 0, len = param.length; i < len; ++i)
          appendContent(name, param[i]);
      } else {
        appendContent(name, param);
      }
    }
  }

  promise.then(function () {
    content.end('--' + boundary + '--\r\n');
  }, function (error) {
    content.emit('error', error);
  });

  return content;
}

module.exports = createContent;
