var d = require('d');
var Error = require('./Error');

/**
 * An error indicating that some maximum length has been exceeded.
 */
function MaxLengthExceededError(maxLength) {
  Error.call(this, 'Maximum length exceeded');
  this.maxLength = maxLength;
}

MaxLengthExceededError.prototype = Object.create(Error.prototype, {

  constructor: d(MaxLengthExceededError)

});

module.exports = MaxLengthExceededError;
