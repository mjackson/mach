var d = require('describe-property');

/**
 * An error indicating that some maximum length has been exceeded.
 */
function MaxLengthExceededError(maxLength) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = 'Maximum length exceeded';
  this.maxLength = maxLength;
}

MaxLengthExceededError.prototype = Object.create(Error.prototype, {

  constructor: d(MaxLengthExceededError)

});

module.exports = MaxLengthExceededError;
