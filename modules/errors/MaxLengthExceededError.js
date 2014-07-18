var d = require('d');
var MachError = require('./Error');

function MaxLengthExceededError(maxLength) {
  MachError.call(this, 'Maximum length exceeded');
  this.maxLength = maxLength;
}

MaxLengthExceededError.prototype = Object.create(MachError.prototype, {

  constructor: d(MaxLengthExceededError)

});

module.exports = MaxLengthExceededError;
