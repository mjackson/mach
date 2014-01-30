var util = require('util');
var errors = module.exports;

errors.Error = MachError;
function MachError(message) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
}

util.inherits(MachError, Error);

errors.MaxLengthExceededError = MaxLengthExceededError;
function MaxLengthExceededError(maxLength) {
  MachError.call(this, 'Maximum length exceeded');
  this.maxLength = maxLength;
}

util.inherits(MaxLengthExceededError, MachError);