var d = require('d');

function MachError(message) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
}

MachError.prototype = Object.create(Error.prototype, {

  constructor: d(MachError)

});

module.exports = MachError;
