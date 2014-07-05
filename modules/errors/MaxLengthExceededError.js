var util = require('util');
var MachError = require('./Error');

function MaxLengthExceededError(maxLength) {
  MachError.call(this, 'Maximum length exceeded');
  this.maxLength = maxLength;
}

util.inherits(MaxLengthExceededError, MachError);

module.exports = MaxLengthExceededError;
