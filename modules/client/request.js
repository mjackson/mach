var Request = require('../Request');

/**
 * Creates and sends a new Request using the given options
 * and returns a promise for the response. See Request.create.
 */
function request(options) {
  return Request.create(options).send();
}

module.exports = request;
