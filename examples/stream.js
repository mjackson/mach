var util = require('util');
var Stream = require('stream');
var Readable = Stream.Readable;

function ContentStream() {
  Readable.call(this);
  this._read = function (size) {
    // no-op
  };
}

util.inherits(ContentStream, Readable);

var mach = require('../lib');

mach.serve(function (request) {
  var response = {
    content: new ContentStream
  };

  var timer = setInterval(function () {
    response.content.push((new Date).toString() + '\n');
  }, 1000);

  request.on('close', function () {
    console.log('client closed connection');
    clearInterval(timer);
  });

  return response;
});
