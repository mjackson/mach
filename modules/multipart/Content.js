var util = require('util');
var EventEmitter = require('events').EventEmitter;

/**
 * A Stream-like class for multipart content.
 */
function Content() {
  EventEmitter.call(this);
  this.readable = true;
  setupContent(this);
}

util.inherits(Content, EventEmitter);

function setupContent(content) {
  content.on('end', function () {
    content.readable = false;
  });
}

module.exports = Content;
