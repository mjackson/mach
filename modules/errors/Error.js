var util = require('util');

function MachError(message) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
}

util.inherits(MachError, Error);

module.exports = MachError;
