var util = require('util');

exports.Error = MachError;
exports.MaxLengthExceededError = MaxLengthExceededError;

function MachError(message) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
}

util.inherits(MachError, Error);

function MaxLengthExceededError(maxLength) {
  MachError.call(this, 'Maximum length exceeded');
  this.maxLength = maxLength;
}

util.inherits(MaxLengthExceededError, MachError);
